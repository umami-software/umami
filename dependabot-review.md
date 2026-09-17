# Dependabot remediation — 2026-09-11

All 52 reviewed open alerts have been addressed in the local dev working tree. Every package entry in pnpm-lock.yaml was compared to the GitHub alert ranges; zero affected versions remain. pnpm audit reports no known vulnerabilities.

The changes are not committed or pushed yet. GitHub still has 52 open alerts because its default branch, master, has the old dependency graph. These should close as fixed after the changes reach master; do not dismiss still-vulnerable master dependencies as inaccurate or unused.

## Changes

- Upgrade @dicebear/collection to ^9.4.3.
- Add targeted security overrides in pnpm-workspace.yaml and regenerate/prune pnpm-lock.yaml, including all vulnerable transitive copies.
- Upgrade d3-color to 3.1.0 and deepmerge-ts to 8.0.2. The former changes module packaging; map SSR and browser bundling passed. Prisma uses the deepmerge API retained in v8; config validation and client generation passed. v8 changes Map merge behavior, which is not used in this repository’s Prisma configuration.
- Convert PostCSS plugin configuration to the object form accepted by Next.js and Vite, retaining all plugin options. This fixes CSS loading in the updated test tooling.

## Verified versions

| Package | Versions in local dev lockfile | Alerts covered |
|---|---|---|
| next | 16.3.4 | [#335](https://github.com/umami-software/umami/security/dependabot/335), [#334](https://github.com/umami-software/umami/security/dependabot/334), [#333](https://github.com/umami-software/umami/security/dependabot/333), [#332](https://github.com/umami-software/umami/security/dependabot/332) |
| sharp | 0.35.4 | [#331](https://github.com/umami-software/umami/security/dependabot/331) |
| vitest | 4.1.11 | [#330](https://github.com/umami-software/umami/security/dependabot/330) |
| @vitest/mocker | 4.1.11 | [#329](https://github.com/umami-software/umami/security/dependabot/329) |
| svgo | 3.3.5 | [#328](https://github.com/umami-software/umami/security/dependabot/328), [#327](https://github.com/umami-software/umami/security/dependabot/327), [#260](https://github.com/umami-software/umami/security/dependabot/260), [#131](https://github.com/umami-software/umami/security/dependabot/131) |
| js-yaml | 4.3.2 | [#326](https://github.com/umami-software/umami/security/dependabot/326), [#308](https://github.com/umami-software/umami/security/dependabot/308), [#254](https://github.com/umami-software/umami/security/dependabot/254), [#253](https://github.com/umami-software/umami/security/dependabot/253) |
| colord | 2.10.0 | [#325](https://github.com/umami-software/umami/security/dependabot/325) |
| browserslist | 4.28.7 | [#324](https://github.com/umami-software/umami/security/dependabot/324), [#323](https://github.com/umami-software/umami/security/dependabot/323) |
| fflate | 0.4.9 | [#322](https://github.com/umami-software/umami/security/dependabot/322) |
| fast-uri | 3.1.6 | [#321](https://github.com/umami-software/umami/security/dependabot/321), [#320](https://github.com/umami-software/umami/security/dependabot/320), [#317](https://github.com/umami-software/umami/security/dependabot/317), [#316](https://github.com/umami-software/umami/security/dependabot/316), [#302](https://github.com/umami-software/umami/security/dependabot/302) |
| @dicebear/initials | 9.4.3 | [#319](https://github.com/umami-software/umami/security/dependabot/319) |
| mysql2 | 3.23.1 | [#318](https://github.com/umami-software/umami/security/dependabot/318), [#315](https://github.com/umami-software/umami/security/dependabot/315) |
| deepmerge-ts | 8.0.2 | [#314](https://github.com/umami-software/umami/security/dependabot/314) |
| nanoid | 3.3.18 | [#313](https://github.com/umami-software/umami/security/dependabot/313) |
| brace-expansion | 1.1.18, 2.1.4, 5.0.9 | [#311](https://github.com/umami-software/umami/security/dependabot/311), [#310](https://github.com/umami-software/umami/security/dependabot/310), [#309](https://github.com/umami-software/umami/security/dependabot/309), [#304](https://github.com/umami-software/umami/security/dependabot/304), [#294](https://github.com/umami-software/umami/security/dependabot/294), [#288](https://github.com/umami-software/umami/security/dependabot/288), [#171](https://github.com/umami-software/umami/security/dependabot/171), [#162](https://github.com/umami-software/umami/security/dependabot/162) |
| d3-color | 3.1.0 | [#292](https://github.com/umami-software/umami/security/dependabot/292) |
| shell-quote | 1.9.0 | [#263](https://github.com/umami-software/umami/security/dependabot/263), [#228](https://github.com/umami-software/umami/security/dependabot/228) |
| @babel/core | 7.29.6 | [#252](https://github.com/umami-software/umami/security/dependabot/252) |
| vite | 8.0.16 | [#235](https://github.com/umami-software/umami/security/dependabot/235), [#234](https://github.com/umami-software/umami/security/dependabot/234) |
| esbuild | 0.28.2 | [#230](https://github.com/umami-software/umami/security/dependabot/230) |
| picomatch | 4.0.4, 4.0.5 | [#153](https://github.com/umami-software/umami/security/dependabot/153) |
| minimatch | 3.1.4, 5.1.8, 5.1.9, 9.0.7 | [#127](https://github.com/umami-software/umami/security/dependabot/127), [#125](https://github.com/umami-software/umami/security/dependabot/125), [#124](https://github.com/umami-software/umami/security/dependabot/124), [#121](https://github.com/umami-software/umami/security/dependabot/121), [#120](https://github.com/umami-software/umami/security/dependabot/120), [#118](https://github.com/umami-software/umami/security/dependabot/118), [#116](https://github.com/umami-software/umami/security/dependabot/116) |

## Validation

- Frozen lockfile installation: passed.
- All 52 Dependabot vulnerable-range comparisons: passed.
- pnpm audit: zero known vulnerabilities.
- Prisma schema validation and client generation: passed.
- API client and MCP builds, including declarations: passed.
- Workspace package tests: 50 passed.
- Map server rendering and browser bundle with d3-color 3.1.0: passed.
- Tracker and recorder Rollup bundles: passed.
- Biome checks for changed JavaScript/JSON and git diff --check: passed.
- Root test suite: 857 tests passed across 115 files (vitest run --maxWorkers=4).
- Next.js production build: passed. The existing Next.js configuration skips TypeScript validation during builds.

Existing React/React DOM peer warnings (react-simple-maps/react-spring) and TypeScript peer warnings (openapi-typescript) remain; these are not vulnerability findings. No new tests were written.
