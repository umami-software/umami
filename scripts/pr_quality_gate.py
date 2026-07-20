"""pr_quality_gate.py — one PR check, one comment.

Runs three checks and folds them into a SINGLE resolvable review thread on the PR:

  1. 🏗️  Build   — auto-detected (npm/yarn/pnpm build, or Python compileall). Source branch.
  2. 🧹  Lint    — ESLint (Node) + Ruff (Python), scoped to CHANGED files. Source branch.
  3. 🛡️  Vulns   — Dependabot alerts API (default branch; matches the Security tab).

Each check gates the merge when its BLOCK_ON_* toggle is "true" (default: all on).
The gate is the resolvable thread + "Require conversation resolution before
merging". Fetch/scan errors fail closed (required check goes red); build/lint
tool errors are caught and reported inline so they never crash the gate.

Scope note: vulnerability counts come from Dependabot, which is computed against
the repo's DEFAULT branch, so they match GitHub Security → Dependabot exactly but
do not reflect dependency changes on the PR branch. Build and lint DO run against
the checked-out source branch.

Speed:
  * ESLint / Ruff lint ONLY the files the PR changed, not the whole repo.
  * Node deps are installed ONLY when the PR touches Node-relevant files.
"""

import os
import re
import sys
import json
import glob
import subprocess
import requests
from datetime import datetime, timezone, timedelta
from collections import defaultdict

# ── Config / env ──────────────────────────────────────────────────────────────

GH_TOKEN    = os.environ["GH_TOKEN"]
DEPENDABOT_PAT = os.environ.get("DEPENDABOT_PAT", "").strip()
REPO        = os.environ["REPO"]
PR_NUMBER   = os.environ["PR_NUMBER"]
PR_HEAD_SHA = os.environ["PR_HEAD_SHA"]
PR_BRANCH   = os.environ.get("PR_BRANCH", "")
SCAN_PATH   = os.environ.get("SCAN_PATH", ".")
# Incremental-scan inputs. On a "synchronize" event these bound the newly
# pushed commits (before..after); on "opened"/"reopened" we scan the whole PR.
EVENT_ACTION = os.environ.get("EVENT_ACTION", "").strip()
BEFORE_SHA   = os.environ.get("BEFORE_SHA", "").strip()
AFTER_SHA    = os.environ.get("AFTER_SHA", "").strip()
API_BASE    = "https://api.github.com"
GRAPHQL     = "https://api.github.com/graphql"

def _flag(name, default):
    return os.environ.get(name, default).strip().lower() in ("1", "true", "yes")

BLOCK_ON_VULN  = _flag("BLOCK_ON_VULN",  "true")
BLOCK_ON_BUILD = _flag("BLOCK_ON_BUILD", "true")
BLOCK_ON_LINT  = _flag("BLOCK_ON_LINT",  "true")

MARKER        = "<!-- pr-quality-gate -->"
LEGACY_MARKER = "Vulnerability Report"

IST = timezone(timedelta(hours=5, minutes=30))

PR_HEADERS = {
    "Authorization": f"Bearer {GH_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}
# Dependabot alerts need a token with security-events/alerts read. Prefer a PAT
# if provided; otherwise fall back to GITHUB_TOKEN (needs security-events: read).
ALERT_HEADERS = {
    "Authorization": f"Bearer {DEPENDABOT_PAT if DEPENDABOT_PAT else GH_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
SEVERITY_EMOJI = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵"}
BLOCK_ON       = {"CRITICAL", "HIGH"}
SEVERITY_MAP   = {
    "CRITICAL": "CRITICAL", "HIGH": "HIGH",
    "MODERATE": "MEDIUM",   "MEDIUM": "MEDIUM",
    "LOW": "LOW", "INFORMATIONAL": "LOW", "NEGLIGIBLE": "LOW",
}

LINT_EXT_JS   = (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue")
NODE_TRIGGERS = LINT_EXT_JS + (".json",)
LOCKFILES     = ("package-lock.json", "yarn.lock", "pnpm-lock.yaml")

# ── Small shell helper ────────────────────────────────────────────────────────

def run(cmd, timeout=1200):
    print(f"[RUN] {' '.join(cmd)}")
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout or "", p.stderr or ""
    except FileNotFoundError:
        return 127, "", f"command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", f"timed out after {timeout}s"

def tail(text, n=40):
    return "\n".join((text or "").rstrip().splitlines()[-n:])

def has_files(pattern):
    return bool(glob.glob(pattern, recursive=True))

# ── Changed files (scope build/lint to the PR or to the latest push) ──────────

_ZERO_SHA = "0" * 40

def _files_from_pr(repo, pr, max_pages=12):
    files, page = [], 1
    while page <= max_pages:
        r = requests.get(f"{API_BASE}/repos/{repo}/pulls/{pr}/files",
                         headers=PR_HEADERS, params={"per_page": 100, "page": page},
                         timeout=15)
        r.raise_for_status()
        batch = r.json()
        files.extend(batch)
        if len(batch) < 100:
            return [f["filename"] for f in files if f.get("status") != "removed"]
        page += 1
    print("[INFO] PR too large to enumerate — full-scan fallback.")
    return None

def _files_from_range(repo, before, after):
    """Files changed by the newly pushed commits (before..after) via compare API."""
    r = requests.get(f"{API_BASE}/repos/{repo}/compare/{before}...{after}",
                     headers=PR_HEADERS, params={"per_page": 100}, timeout=15)
    if not r.ok:
        print(f"[WARN] compare {before[:7]}..{after[:7]} failed {r.status_code} — "
              f"falling back to full PR.")
        return None
    data = r.json()
    files = data.get("files") or []
    # compare tops out around 300 files; if truncated, be safe and scan the PR.
    if data.get("total_commits", 0) and len(files) >= 300:
        print("[INFO] push too large to enumerate — full-scan fallback.")
        return None
    return [f["filename"] for f in files if f.get("status") != "removed"]

def get_changed_files(repo, pr):
    """On 'synchronize', return only files touched by the new push (incremental).
    Otherwise return the full PR file list. None => caller does a full scan.
    Returns (files, incremental_bool)."""
    if EVENT_ACTION == "synchronize" and BEFORE_SHA and BEFORE_SHA != _ZERO_SHA and AFTER_SHA:
        rng = _files_from_range(repo, BEFORE_SHA, AFTER_SHA)
        if rng is not None:
            print(f"[INFO] incremental scan: {len(rng)} file(s) in "
                  f"{BEFORE_SHA[:7]}..{AFTER_SHA[:7]}")
            return rng, True
    return _files_from_pr(repo, pr), False

# ── 1) BUILD (auto-detect, change-aware) ──────────────────────────────────────

def detect_pm():
    if os.path.exists("pnpm-lock.yaml"):
        return "pnpm"
    if os.path.exists("yarn.lock"):
        return "yarn"
    return "npm"

def read_pkg_scripts():
    try:
        with open("package.json", encoding="utf-8") as f:
            return (json.load(f).get("scripts") or {})
    except Exception:
        return {}

def _node_relevant(changed):
    if changed is None:
        return True
    for c in changed:
        base = os.path.basename(c)
        if c.lower().endswith(NODE_TRIGGERS) or base in LOCKFILES or base == "package.json":
            return True
    return False

def section_build(changed):
    try:
        node_present = os.path.exists("package.json")
        py_present   = has_files("**/*.py")

        if node_present:
            if not _node_relevant(changed):
                return {"status": "➖ No Node-relevant changes — build skipped",
                        "ok": True, "ran": False, "detail": ""}
            pm = detect_pm()
            installs = {
                "npm":  ["npm", "ci", "--prefer-offline", "--no-audit", "--no-fund"],
                "yarn": ["yarn", "install", "--frozen-lockfile", "--prefer-offline"],
                "pnpm": ["pnpm", "install", "--frozen-lockfile", "--prefer-offline"],
            }
            rc, out, err = run(installs[pm])
            if rc != 0 and pm == "npm":
                rc, out, err = run(["npm", "install", "--prefer-offline",
                                    "--no-audit", "--no-fund"])
            if rc != 0:
                return {"status": f"❌ `{pm}` install failed", "ok": False,
                        "ran": True, "detail": tail(err or out)}

            scripts = read_pkg_scripts()
            if "build" in scripts:
                bc = {"npm": ["npm", "run", "build"],
                      "yarn": ["yarn", "build"],
                      "pnpm": ["pnpm", "run", "build"]}[pm]
                rc, out, err = run(bc)
                if rc == 0:
                    return {"status": f"✅ `{pm} run build` passed", "ok": True,
                            "ran": True, "detail": ""}
                return {"status": f"❌ `{pm} run build` failed (exit {rc})", "ok": False,
                        "ran": True, "detail": tail(err or out)}
            return {"status": "➖ No `build` script — deps install OK, nothing to build",
                    "ok": True, "ran": False, "detail": ""}

        if py_present:
            if changed is None:
                targets = ["."]
            else:
                targets = [c for c in changed if c.endswith(".py") and os.path.exists(c)]
            if not targets:
                return {"status": "➖ No changed Python files — build skipped",
                        "ok": True, "ran": False, "detail": ""}
            rc, out, err = run(["python", "-m", "compileall", "-q", *targets])
            if rc == 0:
                return {"status": "✅ `python -m compileall` passed", "ok": True,
                        "ran": True, "detail": ""}
            return {"status": f"❌ Python compile failed (exit {rc})", "ok": False,
                    "ran": True, "detail": tail(err or out)}

        return {"status": "➖ No Node/Python project detected — build skipped",
                "ok": True, "ran": False, "detail": ""}
    except Exception as e:
        return {"status": f"⚠️ Build check errored: {e}", "ok": True,
                "ran": False, "detail": ""}

# ── 2) LINT (changed files only, categorized) ─────────────────────────────────

# Three buckets, matching the standalone Lint Report. Edit the sets/prefixes
# below to re-map any rule to a different category.
LINT_CATS = ["Common programming mistakes",
             "Code quality / maintainability",
             "Style / consistency"]

# ESLint core rules that are correctness ("Possible Problems").
ESLINT_CORRECTNESS = {
    "no-unused-vars", "no-undef", "no-const-assign", "no-dupe-keys", "no-dupe-args",
    "no-dupe-class-members", "no-duplicate-case", "no-dupe-else-if", "no-unreachable",
    "no-cond-assign", "no-debugger", "no-empty", "use-isnan", "valid-typeof",
    "no-fallthrough", "no-obj-calls", "no-sparse-arrays", "no-redeclare",
    "no-self-assign", "no-import-assign", "no-func-assign", "no-class-assign",
    "no-setter-return", "no-unsafe-negation", "no-unsafe-optional-chaining",
    "no-constant-condition", "no-control-regex", "no-invalid-regexp",
    "no-irregular-whitespace", "no-misleading-character-class", "no-prototype-builtins",
    "no-unexpected-multiline", "getter-return", "no-async-promise-executor",
    "no-compare-neg-zero",
}
# ESLint core rules that are pure layout/formatting.
ESLINT_STYLE = {
    "semi", "quotes", "jsx-quotes", "indent", "comma-dangle", "comma-spacing",
    "comma-style", "object-curly-spacing", "array-bracket-spacing", "space-before-blocks",
    "space-before-function-paren", "space-in-parens", "space-infix-ops", "keyword-spacing",
    "arrow-spacing", "key-spacing", "block-spacing", "func-call-spacing", "no-multi-spaces",
    "no-multiple-empty-lines", "no-trailing-spaces", "eol-last", "brace-style", "max-len",
    "padded-blocks", "spaced-comment", "quote-props", "semi-spacing", "no-tabs",
    "no-mixed-spaces-and-tabs", "linebreak-style", "no-whitespace-before-property",
    "dot-location", "operator-linebreak", "jsx-indent", "jsx-indent-props",
    "multiline-ternary", "padding-line-between-statements",
}

def _cat_eslint(rule_id, fatal):
    if fatal:
        return LINT_CATS[0]
    rid = rule_id or ""
    if rid.startswith(("@stylistic/", "prettier/")):
        return LINT_CATS[2]
    base = rid.split("/")[-1]
    if rid.startswith("react-hooks/") or base in ESLINT_CORRECTNESS:
        return LINT_CATS[0]
    if base in ESLINT_STYLE:
        return LINT_CATS[2]
    return LINT_CATS[1]

def _cat_ruff(code):
    c = (code or "").upper()
    if c.startswith(("F", "E9", "PLE", "B", "S", "ASYNC", "T10")):   # bugs / likely errors
        return LINT_CATS[0]
    if c.startswith(("E", "W", "I", "D", "Q", "COM", "N", "ISC", "TID", "ERA", "EM")):
        return LINT_CATS[2]                                          # style / imports / naming
    return LINT_CATS[1]                                              # everything else = quality

def section_lint(changed):
    cats = {c: {"errors": 0, "warnings": 0, "items": []} for c in LINT_CATS}
    errors = warnings = 0
    ran = False
    notes = []

    def add(cat, sev, file, line, code, message):
        nonlocal errors, warnings
        b = cats[cat]
        if sev == "error":
            b["errors"] += 1; errors += 1
        else:
            b["warnings"] += 1; warnings += 1
        if len(b["items"]) < 50:
            b["items"].append({"sev": sev, "file": file, "line": line,
                               "code": code or "-", "message": message})

    # ESLint on changed JS/TS (uses the repo's own eslint from node_modules)
    if os.path.exists("package.json"):
        targets = (["."] if changed is None
                   else [c for c in changed
                         if c.lower().endswith(LINT_EXT_JS) and os.path.exists(c)])
        if targets:
            rc, out, err = run(["npx", "--no-install", "eslint", *targets, "-f", "json"])
            try:
                results = json.loads(out) if out.strip().startswith("[") else None
            except json.JSONDecodeError:
                results = None
            if results is not None:
                ran = True
                for r in results:
                    fname = (r.get("filePath") or "").split("/")[-1]
                    for m in r.get("messages", []) or []:
                        sev  = "error" if m.get("severity") == 2 else "warning"
                        rid  = m.get("ruleId")
                        cat  = _cat_eslint(rid, m.get("fatal"))
                        add(cat, sev, fname, m.get("line", "?"), rid,
                            (m.get("message") or "").strip())
            else:
                notes.append("ESLint not configured / skipped")
        else:
            notes.append("no changed JS/TS files")

    # Ruff on changed Python
    if has_files("**/*.py"):
        targets = (["."] if changed is None
                   else [c for c in changed if c.endswith(".py") and os.path.exists(c)])
        if targets:
            rc, out, err = run(["ruff", "check", *targets, "--output-format=json"])
            try:
                issues = json.loads(out) if out.strip().startswith("[") else None
            except json.JSONDecodeError:
                issues = None
            if issues is not None:
                ran = True
                for i in issues:
                    code  = i.get("code") or ""
                    fname = (i.get("filename") or "").split("/")[-1]
                    line  = (i.get("location") or {}).get("row", "?")
                    add(_cat_ruff(code), "error", fname, line, code,
                        (i.get("message") or "").strip())
            else:
                notes.append("Ruff not runnable / skipped")
        else:
            notes.append("no changed Python files")

    return {"errors": errors, "warnings": warnings, "cats": cats,
            "ran": ran, "notes": notes}

# ── 3) VULNS (Dependabot alerts API — matches the Security tab, fail-closed) ───
#
# NOTE ON SCOPE: Dependabot alerts are computed against the repo's DEFAULT
# branch, so these counts match the GitHub Security → Dependabot tab exactly.
# They do NOT reflect dependency changes made on the PR's source branch — that
# is the intentional trade-off for exact parity with the tab. (Build and lint
# below still run against the checked-out source branch.)

def get_next_url(link_header):
    """Follow the Link header's rel=next cursor (alerts API is cursor-paginated)."""
    if not link_header or 'rel="next"' not in link_header:
        return None
    for part in link_header.split(","):
        if 'rel="next"' in part:
            m = re.search(r"<([^>]+)>", part)
            if m:
                return m.group(1)
    return None

def fetch_dependabot_counts(repo=REPO):
    """Fetch ALL open Dependabot alerts -> (counts, top_alerts). Fails CLOSED."""
    counts, blocking_alerts = defaultdict(int), []
    url    = f"{API_BASE}/repos/{repo}/dependabot/alerts"
    params = {"state": "open", "per_page": 100}
    all_alerts, page_num = [], 0

    while url:
        page_num += 1
        resp = requests.get(url, headers=ALERT_HEADERS, params=params, timeout=15)
        print(f"[INFO] Alerts page {page_num} status: {resp.status_code}")
        if resp.status_code in (400, 401, 403, 404):
            raise RuntimeError(
                f"Dependabot alerts API returned {resp.status_code} for {repo}. "
                f"Check DEPENDABOT_PAT scope and that alerts are enabled. "
                f"Body: {resp.text[:300]}"
            )
        resp.raise_for_status()
        batch = resp.json()
        all_alerts.extend(batch)
        url    = get_next_url(resp.headers.get("Link", ""))
        params = None  # the next URL already carries the cursor + per_page

    print(f"[INFO] Total open alerts fetched: {len(all_alerts)}")

    for alert in all_alerts:
        adv  = alert.get("security_advisory", {})
        vuln = alert.get("security_vulnerability", {})
        raw  = (adv.get("severity") or vuln.get("severity") or "UNKNOWN").upper()
        sev  = SEVERITY_MAP.get(raw, raw)
        counts[sev] += 1
        if sev in BLOCK_ON:
            dep = alert.get("dependency", {})
            pkg = dep.get("package", {}).get("name", "—")
            eco = dep.get("package", {}).get("ecosystem", "")
            cve = adv.get("cve_id") or adv.get("ghsa_id", "—")
            fix = "—"
            pv  = vuln.get("first_patched_version", {}) or {}
            if pv.get("identifier"):
                fix = pv["identifier"]
            else:
                for v in adv.get("vulnerabilities", []):
                    fpv = v.get("first_patched_version", {}) or {}
                    if fpv.get("identifier"):
                        fix = fpv["identifier"]; break
            blocking_alerts.append({
                "severity": sev,
                "pkg": f"{pkg} ({eco})" if eco else pkg,
                "vuln_id": cve,
                "title": (adv.get("summary") or "No summary")[:80],
                "fixed_ver": fix,
                "alert_url": alert.get("html_url", ""),
            })

    blocking_alerts.sort(key=lambda a: SEVERITY_ORDER.index(a["severity"]))
    print(f"[INFO] Vuln counts: {dict(counts)}")
    return dict(counts), blocking_alerts[:10]

# ── Combined comment body ─────────────────────────────────────────────────────

def _gate_tag(is_gate):
    return " _(merge gate)_" if is_gate else " _(advisory)_"

def build_body(build, lint, counts, top_alerts, blockers, noted, incremental=False):
    ts = datetime.now(IST).strftime("%Y-%m-%d %H:%M IST")

    if blockers:
        banner = ("🚨 **Merge blocked by: " + ", ".join(blockers) +
                  ". Fix the issue(s), or resolve this conversation to override.**")
    else:
        banner = "✅ **All gated checks passed — merge unblocked.**"

    scope = ("\n> ♻️ Incremental run — build & lint reflect only the files in the "
             "latest push. (Vulnerabilities are always the full default-branch set.)"
             if incremental else "")

    note = (f"\n> ⚠️ Non-gating issues in **{', '.join(noted)}** — shown below, not blocking."
            if noted else "")
    note = scope + note

    build_detail = (f"\n<details><summary>Build output (tail)</summary>\n\n```\n"
                    f"{build['detail']}\n```\n</details>\n" if build.get("detail") else "")
    build_sec = f"### 🏗️ Build{_gate_tag(BLOCK_ON_BUILD)}\n{build['status']}\n{build_detail}"

    lc = lint["cats"]
    any_findings = any(v["errors"] or v["warnings"] for v in lc.values())
    if not any_findings:
        extra = f" ({'; '.join(lint['notes'])})" if lint.get("notes") else ""
        lint_body = f"✅ No lint issues{extra}"
    else:
        summary_lines = []
        for cat in LINT_CATS:
            e, w = lc[cat]["errors"], lc[cat]["warnings"]
            if e == 0 and w == 0:
                summary_lines.append(f"- ✅ **{cat}** — no issues")
            elif w:
                summary_lines.append(f"- ❌ **{cat}** — {e} error(s), {w} warning(s)")
            else:
                summary_lines.append(f"- ❌ **{cat}** — {e} error(s)")
        summary = "\n".join(summary_lines)
        total   = f"\n\n**Total:** {lint['errors']} error(s), {lint['warnings']} warning(s)"
        notes   = f"\n\n_{'; '.join(lint['notes'])}_" if lint.get("notes") else ""
        def _esc(s):
            return str(s).replace("|", "\\|").replace("\n", " ").strip()
        blocks = ""
        for cat in LINT_CATS:
            n = lc[cat]["errors"] + lc[cat]["warnings"]
            if n:
                rows = "\n".join(
                    f"| {'🔴' if it['sev'] == 'error' else '🟡'} "
                    f"| `{_esc(it['file'])}` | {_esc(it['line'])} "
                    f"| `{_esc(it['code'])}` | {_esc(it['message'])} |"
                    for it in lc[cat]["items"]
                )
                table = ("|  | File | Line | Rule | Message |\n"
                         "|:-:|:-----|:----:|:-----|:--------|\n" + rows)
                more = ("" if n <= len(lc[cat]["items"])
                        else f"\n\n_…and {n - len(lc[cat]['items'])} more_")
                blocks += (f"\n<details><summary>{cat} ({n})</summary>\n\n"
                           f"{table}{more}\n\n</details>\n")
        lint_body = f"{summary}{total}{notes}\n{blocks}"
    lint_sec = f"### 🧹 Lint{_gate_tag(BLOCK_ON_LINT)}\n{lint_body}\n"

    total = sum(counts.get(s, 0) for s in SEVERITY_ORDER)
    rows = "".join(
        f"| {SEVERITY_EMOJI.get(s,'⚪')} **{s}** | `{counts[s]}` |\n"
        for s in SEVERITY_ORDER if counts.get(s, 0) > 0
    )
    table = (f"| Severity | Count |\n|:---------|------:|\n{rows}| **TOTAL** | **`{total}`** |"
             if total else "No vulnerabilities detected. ✅")

    detail = ""
    if top_alerts:
        rows2 = "\n".join(
            f"| {SEVERITY_EMOJI.get(a['severity'],'⚪')} {a['severity']} "
            f"| [{a['vuln_id']}]({a['alert_url']}) | `{a['pkg']}` | {a['title']} | {a['fixed_ver']} |"
            for a in top_alerts
        )
        detail = (
            "\n<details>\n<summary>🔍 Top Critical & High Vulnerabilities (up to 10)</summary>\n\n"
            "| Severity | CVE / GHSA | Package | Summary | Fix Version |\n"
            "|:---------|:-----------|:--------|:--------|:------------|\n"
            f"{rows2}\n\n</details>\n"
        )
    vuln_sec = f"### 🛡️ Vulnerabilities{_gate_tag(BLOCK_ON_VULN)}\n\n{table}\n{detail}"

    return (
        f"{MARKER}\n"
        f"## 🚦 PR Quality Gate\n\n{banner}{note}\n\n"
        f"{build_sec}\n{lint_sec}\n{vuln_sec}\n"
        f"---\n"
        f"> 🌿 Branch `{PR_BRANCH or PR_HEAD_SHA[:8]}` · 📅 {ts} · commit `{PR_HEAD_SHA[:8]}`\n"
    )

# ── GraphQL (find / resolve / unresolve threads) ──────────────────────────────

def gql(query, variables):
    r = requests.post(GRAPHQL, headers=PR_HEADERS,
                      json={"query": query, "variables": variables}, timeout=15)
    r.raise_for_status()
    data = r.json()
    if data.get("errors"):
        raise RuntimeError(f"GraphQL error: {data['errors']}")
    return data["data"]

def find_bot_thread(repo, pr):
    owner, name = repo.split("/", 1)
    q = """
    query($owner:String!,$name:String!,$pr:Int!){
      repository(owner:$owner,name:$name){
        pullRequest(number:$pr){
          reviewThreads(first:100){
            nodes{ id isResolved
              comments(first:1){ nodes{ databaseId body author{login} } } }
          }
        }
      }
    }"""
    data = gql(q, {"owner": owner, "name": name, "pr": int(pr)})
    for t in data["repository"]["pullRequest"]["reviewThreads"]["nodes"]:
        comments = t["comments"]["nodes"]
        if not comments:
            continue
        c = comments[0]
        login = (c.get("author") or {}).get("login", "")
        body  = c.get("body") or ""
        if "github-actions" in login and (MARKER in body or LEGACY_MARKER in body):
            return {"thread_id": t["id"], "resolved": t["isResolved"],
                    "comment_id": c["databaseId"]}
    return None

def resolve_thread(tid):
    try:
        gql("mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}", {"id": tid})
        print("[INFO] Thread resolved.")
    except Exception as e:
        print(f"[WARN] resolve failed (non-fatal): {e}")

def unresolve_thread(tid):
    try:
        gql("mutation($id:ID!){unresolveReviewThread(input:{threadId:$id}){thread{isResolved}}}", {"id": tid})
        print("[INFO] Thread re-opened.")
    except Exception as e:
        print(f"[WARN] unresolve failed (non-fatal): {e}")

# ── REST (create / update review comment, diff anchor) ─────────────────────────

def find_diff_anchor(repo, pr):
    resp = requests.get(f"{API_BASE}/repos/{repo}/pulls/{pr}/files",
                        headers=PR_HEADERS, params={"per_page": 100}, timeout=15)
    resp.raise_for_status()
    for f in resp.json():
        patch = f.get("patch")
        if not patch:
            continue
        new_line = None
        for line in patch.splitlines():
            if line.startswith("@@"):
                m = re.search(r"\+(\d+)", line)
                new_line = (int(m.group(1)) - 1) if m else None
            elif new_line is not None and line.startswith("+") and not line.startswith("+++"):
                return f["filename"], new_line + 1
            elif new_line is not None and line.startswith(" "):
                return f["filename"], new_line + 1
    return None, None

def create_resolvable_thread(repo, pr, body, path, line):
    r = requests.post(f"{API_BASE}/repos/{repo}/pulls/{pr}/comments", headers=PR_HEADERS,
                      json={"body": body, "commit_id": PR_HEAD_SHA,
                            "path": path, "line": line, "side": "RIGHT"}, timeout=15)
    if not r.ok:
        print(f"[ERROR] create thread failed {r.status_code}: {r.text[:200]}")
    r.raise_for_status()
    print(f"[INFO] ✅ Thread created id={r.json().get('id')} at {path}:{line}")

def update_thread_comment(repo, comment_id, body):
    try:
        r = requests.patch(f"{API_BASE}/repos/{repo}/pulls/comments/{comment_id}",
                           headers=PR_HEADERS, json={"body": body}, timeout=15)
        r.raise_for_status()
        print(f"[INFO] Thread comment #{comment_id} updated.")
    except Exception as e:
        print(f"[WARN] comment update failed (non-fatal): {e}")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60); print("[START] PR Quality Gate"); print("=" * 60)

    changed, incremental = get_changed_files(REPO, PR_NUMBER)
    print(f"[INFO] scope={'incremental (this push)' if incremental else 'full PR'} "
          f"files={'ALL (fallback)' if changed is None else len(changed)}")

    # Vulnerabilities: Dependabot alerts API (default branch, matches the tab).
    # These are independent of the PR's commits, so they never change per push.
    counts, top_alerts = fetch_dependabot_counts(REPO)
    # Build + lint reflect ONLY `changed` (the whole PR on first run, or just the
    # latest push on synchronize).
    build = section_build(changed)
    print(f"[INFO] build={build['status']}")
    lint = section_lint(changed)
    print(f"[INFO] lint errors={lint['errors']} warnings={lint['warnings']}")

    vuln_bad  = any(counts.get(s, 0) > 0 for s in BLOCK_ON)
    build_bad = not build["ok"]
    lint_bad  = lint.get("errors", 0) > 0

    blockers, noted = [], []
    for gate, bad, label in (
        (BLOCK_ON_BUILD, build_bad, "build"),
        (BLOCK_ON_LINT,  lint_bad,  "lint"),
        (BLOCK_ON_VULN,  vuln_bad,  "vulnerabilities"),
    ):
        if bad and gate:
            blockers.append(label)
        elif bad and not gate:
            noted.append(label)

    # "code_blockers" = issues the CURRENT scan surfaced in build/lint. On an
    # incremental run these come only from the latest push. Vulnerabilities are
    # excluded here because they are pre-existing default-branch findings — once a
    # human resolves the thread to accept them, a later commit shouldn't re-raise
    # them; only NEW build/lint problems from that commit should re-block.
    code_blockers = [b for b in blockers if b in ("build", "lint")]
    all_blocking  = bool(blockers)
    print(f"[INFO] blockers={blockers} code_blockers={code_blockers} "
          f"resolved_gate={all_blocking}")

    body = build_body(build, lint, counts, top_alerts, blockers, noted, incremental)
    existing = find_bot_thread(REPO, PR_NUMBER)
    print(f"[INFO] existing_thread={existing}")

    if existing:
        update_thread_comment(REPO, existing["comment_id"], body)
        if existing["resolved"]:
            # Already accepted by a human. Only re-open if THIS push introduced a
            # build/lint blocker — do not re-block on pre-existing vulnerabilities.
            if code_blockers:
                print("[INFO] New build/lint blocker in this push — re-opening thread.")
                unresolve_thread(existing["thread_id"])
            else:
                print("[INFO] No new build/lint blockers — leaving thread resolved.")
        else:
            # Currently open: resolve once nothing is blocking anymore.
            if not all_blocking:
                resolve_thread(existing["thread_id"])
    else:
        path, line = find_diff_anchor(REPO, PR_NUMBER)
        if not path:
            if all_blocking:
                raise RuntimeError(
                    "Blocking issues present but no commentable diff line to anchor "
                    "the resolvable thread. Failing closed.")
            print("[INFO] Clean + no anchorable line — skipping comment.")
        else:
            create_resolvable_thread(REPO, PR_NUMBER, body, path, line)
            if not all_blocking:
                fresh = find_bot_thread(REPO, PR_NUMBER)
                if fresh and not fresh["resolved"]:
                    resolve_thread(fresh["thread_id"])

    print("=" * 60); print("[DONE]"); print("=" * 60)
    sys.exit(0)

if __name__ == "__main__":
    main()
