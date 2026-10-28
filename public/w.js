/*
 * Umami marketing widgets loader (fork). Usage:
 *   <script async src="https://HOST/w.js" data-website="WEBSITE_ID"></script>
 * Fetches the enabled widgets of the website and renders them inside a Shadow DOM so site CSS
 * cannot break them and they cannot break the site. All text is inserted with textContent.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var preview = window.__UMAMI_W_PREVIEW;
  if (!script && !preview) return;

  var website = script && script.getAttribute('data-website');
  var base = script ? new URL(script.src).origin : (preview && preview.api) || '';
  if (!website && !preview) return;
  if (window.__umamiWidgetsLoaded && !preview) return;
  window.__umamiWidgetsLoaded = true;

  var Z = 2147483000;
  var DEFAULTS = {
    radius: 16, shadow: 'soft', glass: true, size: 'md', buttonStyle: 'solid', icon: '', animation: 'slide',
    overlayDim: 45, customCss: '', bg: '', fg: '', devices: 'all', visitor: 'all', minPageViews: 0,
    minTimeSec: 0, utmSource: '', utmMedium: '', utmCampaign: '', referrer: '', hoursEnabled: false,
    hoursFrom: '09:00', hoursTo: '18:00', hoursDays: [1, 2, 3, 4, 5], offHours: 'message', offHoursText: '',
    hideAfterConversion: true, theme: 'auto', accent: '#3b82f6', trigger: 'immediate', frequency: 'session',
    delaySec: 5, scrollPct: 50, position: 'bottom-right', dismissible: true
  };

  function cfg(c) {
    var o = {};
    Object.keys(DEFAULTS).forEach(function (k) { o[k] = DEFAULTS[k]; });
    Object.keys(c || {}).forEach(function (k) { if (c[k] !== undefined && c[k] !== null) o[k] = c[k]; });
    return o;
  }

  function track(name, data) {
    try {
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
    } catch (e) {}
  }

  function safeUrl(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u) ? u : '';
  }

  /* ---------- visitor state (first-party storage only, no cookies, no PII) ---------- */
  var visit = (function () {
    var v = { returning: false, pageViews: 1, sessionMs: 0, utm: {}, referrer: document.referrer || '' };
    if (preview) return v;
    try {
      v.returning = !!localStorage.getItem('uw:visited');
      localStorage.setItem('uw:visited', '1');
      var pv = Number(sessionStorage.getItem('uw:pv') || 0) + 1;
      sessionStorage.setItem('uw:pv', String(pv));
      v.pageViews = pv;
      var t0 = Number(sessionStorage.getItem('uw:t0') || 0);
      if (!t0) { t0 = Date.now(); sessionStorage.setItem('uw:t0', String(t0)); }
      v.sessionMs = Date.now() - t0;
      var p = new URLSearchParams(location.search);
      var stored = {};
      try { stored = JSON.parse(sessionStorage.getItem('uw:utm') || '{}'); } catch (e) {}
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (p.get(k)) stored[k] = p.get(k); });
      sessionStorage.setItem('uw:utm', JSON.stringify(stored));
      v.utm = stored;
      var ref = sessionStorage.getItem('uw:ref');
      if (ref === null) { sessionStorage.setItem('uw:ref', v.referrer); } else { v.referrer = ref; }
    } catch (e) {}
    return v;
  })();

  function list(str) {
    return String(str || '').split(/[,\n]/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  }

  function anyMatch(needles, value) {
    if (!needles.length) return true;
    value = String(value || '').toLowerCase();
    return needles.some(function (n) { return value.indexOf(n) !== -1; });
  }

  function matches(listStr, path) {
    var lines = String(listStr || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) return null;
    return lines.some(function (p) {
      if (p.charAt(0) !== '/' && p.charAt(0) !== '*') p = '/' + p;
      var re = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      return re.test(path);
    });
  }

  function minutes(hhmm) {
    var m = /^(\d{2}):(\d{2})$/.exec(hhmm || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  }

  function inWorkingHours(c) {
    var now = new Date();
    if (c.hoursDays.indexOf(now.getDay()) === -1) return false;
    var cur = now.getHours() * 60 + now.getMinutes();
    var a = minutes(c.hoursFrom), b = minutes(c.hoursTo);
    return a <= b ? cur >= a && cur < b : cur >= a || cur < b;
  }

  function isMobile() {
    return (window.matchMedia && matchMedia('(max-width:768px)').matches) || ('ontouchstart' in window && screen.width < 900);
  }

  function convertedKey(id) { return 'uw:done:' + id; }

  /** Returns false to skip, or the (possibly adjusted) config to render. */
  function evaluate(w) {
    var c = cfg(w.config);
    if (preview) return c;
    var path = location.pathname;
    var inc = matches(c.urlInclude, path);
    if (inc === false) return false;
    if (matches(c.urlExclude, path) === true) return false;
    var now = Date.now();
    if (c.startAt && now < Date.parse(c.startAt)) return false;
    if (c.endAt && now > Date.parse(c.endAt)) return false;
    if (c.devices === 'mobile' && !isMobile()) return false;
    if (c.devices === 'desktop' && isMobile()) return false;
    if (c.visitor === 'new' && visit.returning) return false;
    if (c.visitor === 'returning' && !visit.returning) return false;
    if (visit.pageViews < c.minPageViews) return false;
    if (list(c.utmSource).length && !anyMatch(list(c.utmSource), visit.utm.utm_source)) return false;
    if (list(c.utmMedium).length && !anyMatch(list(c.utmMedium), visit.utm.utm_medium)) return false;
    if (list(c.utmCampaign).length && !anyMatch(list(c.utmCampaign), visit.utm.utm_campaign)) return false;
    if (list(c.referrer).length && !anyMatch(list(c.referrer), visit.referrer)) return false;
    try {
      if (c.hideAfterConversion && localStorage.getItem(convertedKey(w.id))) return false;
    } catch (e) {}
    if (c.hoursEnabled && !inWorkingHours(c)) {
      if (c.offHours === 'hide') return false;
      if (c.offHours === 'message' && c.offHoursText) {
        var o = {};
        Object.keys(c).forEach(function (k) { o[k] = c[k]; });
        o.text = c.offHoursText;
        c = o;
      }
    }
    return c;
  }

  function freqKey(id) { return 'uw:' + id; }

  function canShow(w, c) {
    if (preview) return true;
    var f = c.frequency;
    try {
      if (f === 'always') return true;
      if (f === 'session') return !sessionStorage.getItem(freqKey(w.id));
      var t = Number(localStorage.getItem(freqKey(w.id)) || 0);
      if (f === 'once') return !t;
      var span = f === 'day' ? 864e5 : 6048e5;
      return !t || Date.now() - t > span;
    } catch (e) {
      return true;
    }
  }

  function markSeen(w) {
    if (preview) return;
    try {
      sessionStorage.setItem(freqKey(w.id), '1');
      localStorage.setItem(freqKey(w.id), String(Date.now()));
    } catch (e) {}
  }

  /* ---------- styling ---------- */
  var CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
    '.w{--bg:#fff;--fg:#0f172a;--mut:#64748b;--line:rgba(15,23,42,.12);--card:rgba(255,255,255,.82);--r:16px;--fs:14px;--sh:0 18px 50px -18px rgba(15,23,42,.45);position:fixed;z-index:2147483000;color:var(--fg);font-size:var(--fs);line-height:1.45}',
    '.w.dark{--bg:#141824;--fg:#f1f5f9;--mut:#94a3b8;--line:rgba(255,255,255,.14);--card:rgba(20,24,36,.82)}',
    '.w.solid .card{background:var(--bg);-webkit-backdrop-filter:none;backdrop-filter:none}',
    '.card{background:var(--card);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh);padding:18px;width:min(340px,calc(100vw - 24px));color:var(--fg)}',
    '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.card{background:var(--bg)}}',
    'h3{margin:0 0 6px;font-size:calc(var(--fs) + 2px);font-weight:650;letter-spacing:-.01em}',
    'p{margin:0 0 12px;color:var(--mut)}',
    'input[type=text],input[type=tel],input[type=email],textarea{width:100%;margin:0 0 8px;padding:10px 12px;font-size:var(--fs);border:1px solid var(--line);border-radius:calc(var(--r)*.6);background:var(--bg);color:var(--fg);outline:none}',
    'input:focus,textarea:focus{border-color:var(--a);box-shadow:0 0 0 3px color-mix(in srgb,var(--a) 28%,transparent)}',
    'button,a.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid transparent;cursor:pointer;text-decoration:none;font-weight:600;font-size:var(--fs);padding:10px 16px;border-radius:calc(var(--r)*.6);background:var(--a);color:var(--af);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}',
    '.bs-outline button,.bs-outline a.btn{background:transparent;color:var(--a);border-color:var(--a);box-shadow:none}',
    '.bs-pill button,.bs-pill a.btn{border-radius:999px}',
    'button:hover,a.btn:hover{filter:brightness(1.07)}',
    'button:focus-visible,a.btn:focus-visible,.x:focus-visible{outline:2px solid var(--a);outline-offset:2px}',
    '.full{width:100%}',
    '.x{position:absolute;top:8px;right:8px;width:28px;height:28px;padding:0;background:transparent!important;color:var(--mut)!important;border:0!important;box-shadow:none!important;font-size:18px;line-height:1;border-radius:999px}',
    '.consent{display:flex;gap:8px;align-items:flex-start;color:var(--mut);font-size:12px;margin:0 0 10px}',
    '.consent input{margin-top:2px}',
    '.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}',
    '.pill{border-radius:999px!important;padding:12px 20px;box-shadow:0 10px 30px -10px var(--a)}',
    '.msg{margin:0;color:var(--fg)}',
    '.err{color:#dc2626;font-size:12px;margin:0 0 8px}',
    '.promo{display:flex;gap:8px;align-items:center;margin:0 0 12px;padding:8px 10px;border:1px dashed var(--line);border-radius:calc(var(--r)*.6);font-family:ui-monospace,monospace;font-weight:600}',
    '.promo button{padding:4px 10px;font-size:12px;margin-left:auto}',
    '.bar{left:0;right:0;display:flex;gap:12px;align-items:center;justify-content:center;padding:10px 44px 10px 16px;background:var(--a);color:var(--af);text-align:center;box-shadow:var(--sh)}',
    '.bar a.btn{background:var(--af);color:var(--a);padding:6px 12px;box-shadow:none;border-color:transparent}',
    '.bar .x{color:var(--af)!important;top:50%;transform:translateY(-50%)}',
    '.overlay{inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,var(--dim,.45));-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}',
    '.overlay .card{position:relative;width:min(420px,calc(100vw - 24px));padding:24px}',
    '.overlay img{display:block;width:100%;max-height:180px;object-fit:cover;border-radius:calc(var(--r)*.6);margin:0 0 12px}',
    '.card img{max-width:100%}',
    '.bl{left:16px;bottom:16px}.br{right:16px;bottom:16px}',
    '@media(max-width:480px){.bl,.br{left:12px;right:12px;bottom:12px}.card{width:auto}}',
    '@media(prefers-reduced-motion:no-preference){',
    '.an-slide .card,.an-slide .pill{animation:s .35s cubic-bezier(.22,1,.36,1) both}',
    '.an-fade .card,.an-fade .pill,.an-fade.bar{animation:f .4s ease both}',
    '.an-pop .card,.an-pop .pill{animation:p .38s cubic-bezier(.34,1.56,.64,1) both}',
    '@keyframes s{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '@keyframes f{from{opacity:0}to{opacity:1}}',
    '@keyframes p{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}}'
  ].join('');

  var SHADOWS = {
    none: 'none',
    soft: '0 18px 50px -18px rgba(15,23,42,.45)',
    strong: '0 24px 70px -12px rgba(15,23,42,.65)'
  };

  function fgFor(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return l > 0.62 ? '#0b1220' : '#ffffff';
  }

  function cleanCss(css) {
    return String(css || '').replace(/@import[^;]*;?/gi, '').replace(/<\/?style/gi, '').slice(0, 3000);
  }

  function el(tag, props, children) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'text') e.textContent = props[k];
      else if (k === 'class') e.className = props[k];
      else e.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  function mount(w, c) {
    var host = document.createElement('div');
    host.setAttribute('data-umami-widget', w.id);
    var root = host.attachShadow({ mode: 'open' });
    var dark = c.theme === 'dark' || (c.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var cls = ['w'];
    if (dark) cls.push('dark');
    if (!c.glass || c.bg) cls.push('solid');
    cls.push('bs-' + c.buttonStyle, 'an-' + c.animation);
    var wrap = el('div', { class: cls.join(' ') });
    wrap.style.setProperty('--a', c.accent);
    wrap.style.setProperty('--af', fgFor(c.accent));
    wrap.style.setProperty('--r', c.radius + 'px');
    wrap.style.setProperty('--fs', ({ sm: 13, md: 14, lg: 16 })[c.size] + 'px');
    wrap.style.setProperty('--sh', SHADOWS[c.shadow] || SHADOWS.soft);
    wrap.style.setProperty('--dim', String(c.overlayDim / 100));
    if (c.bg) {
      var f = c.fg || fgFor(c.bg);
      wrap.style.setProperty('--bg', c.bg);
      wrap.style.setProperty('--fg', f);
      wrap.style.setProperty('--mut', 'color-mix(in srgb,' + f + ' 62%,transparent)');
      wrap.style.setProperty('--line', 'color-mix(in srgb,' + f + ' 20%,transparent)');
    } else if (c.fg) {
      wrap.style.setProperty('--fg', c.fg);
    }
    root.appendChild(el('style', { text: CSS }));
    root.appendChild(wrap);
    if (c.customCss) root.appendChild(el('style', { text: cleanCss(c.customCss) }));
    var iconText = c.icon ? c.icon + ' ' : '';
    var pillEl;

    function close(remember) {
      if (remember !== false) markSeen(w);
      host.remove();
    }

    function closeBtn(fn) {
      var b = el('button', { class: 'x', type: 'button', 'aria-label': 'Close', text: '×' });
      b.addEventListener('click', function () { (fn || close)(); });
      return b;
    }

    function link(label, url, cls) {
      var u = safeUrl(url);
      if (!u || !label) return null;
      var a = el('a', { class: 'btn ' + (cls || ''), href: u, target: '_blank', rel: 'noopener noreferrer', text: label });
      a.addEventListener('click', function () { track('widget-click', { id: w.id, type: w.type }); });
      return a;
    }

    function converted() {
      try { localStorage.setItem(convertedKey(w.id), String(Date.now())); } catch (e) {}
    }

    function form(fields, onDone) {
      var f = el('form', { novalidate: '' });
      var err = el('p', { class: 'err', role: 'alert' });
      err.hidden = true;
      var inputs = {};
      fields.forEach(function (d) {
        var i = d.multiline ? el('textarea', { rows: '2', placeholder: d.ph, 'aria-label': d.ph, name: d.name }) : el('input', { type: d.type, placeholder: d.ph, 'aria-label': d.ph, name: d.name, autocomplete: d.ac || 'off' });
        inputs[d.name] = i;
        f.appendChild(i);
      });
      var hp = el('input', { type: 'text', name: 'hp', tabindex: '-1', autocomplete: 'off', class: 'hp', 'aria-hidden': 'true' });
      f.appendChild(hp);
      var consent;
      if (c.consentText) {
        consent = el('input', { type: 'checkbox' });
        f.appendChild(el('label', { class: 'consent' }, [consent, el('span', { text: c.consentText })]));
      }
      f.appendChild(el('div', {}, [err]));
      var btn = el('button', { type: 'submit', class: 'full', text: c.buttonText || 'Send' });
      f.appendChild(btn);
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (consent && !consent.checked) { err.textContent = 'Please accept the consent.'; err.hidden = false; return; }
        var payload = { page: location.href.slice(0, 500), hp: hp.value };
        Object.keys(inputs).forEach(function (k) { payload[k] = inputs[k].value; });
        btn.disabled = true;
        if (preview) { onDone(); return; }
        fetch(base + '/api/w/lead/' + w.id, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) })
          .then(function (r) {
            if (!r.ok) throw new Error('bad');
            track('widget-lead', { id: w.id, type: w.type });
            converted();
            onDone();
          })
          .catch(function () {
            btn.disabled = false;
            err.textContent = 'Could not send. Please check the data and try again.';
            err.hidden = false;
          });
      });
      return f;
    }

    function done(card) {
      card.textContent = '';
      card.appendChild(closeBtn());
      card.appendChild(el('p', { class: 'msg', role: 'status', text: c.successText }));
      markSeen(w);
      setTimeout(function () { close(false); }, 4000);
    }

    if (w.type === 'banner') {
      wrap.className += ' bar';
      wrap.style[c.position === 'bottom' ? 'bottom' : 'top'] = '0';
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', 'Announcement');
      if (c.bg) { wrap.style.background = c.bg; wrap.style.color = wrap.style.getPropertyValue('--fg'); }
      wrap.appendChild(el('span', { text: iconText + c.text }));
      var bl = link(c.buttonText, c.buttonUrl);
      if (bl) wrap.appendChild(bl);
      if (c.dismissible) wrap.appendChild(closeBtn());
    } else if (w.type === 'callback') {
      wrap.className += ' ' + (c.position === 'bottom-left' ? 'bl' : 'br');
      var pill = pillEl = el('button', { type: 'button', class: 'pill', 'aria-haspopup': 'dialog', text: iconText + (c.buttonText || 'Call me back') });
      var card;
      pill.addEventListener('click', function () {
        if (card) { card.remove(); card = null; wrap.style.zIndex = ''; return; }
        wrap.style.zIndex = String(Z + 5);
        card = el('div', { class: 'card', role: 'dialog', 'aria-label': c.title || 'Callback' });
        card.appendChild(closeBtn(function () { card.remove(); card = null; wrap.style.zIndex = ''; }));
        card.appendChild(el('h3', { text: c.title }));
        if (c.text) card.appendChild(el('p', { text: c.text }));
        var fields = [];
        if (c.askName) fields.push({ name: 'name', type: 'text', ph: 'Your name', ac: 'name' });
        fields.push({ name: 'phone', type: 'tel', ph: 'Phone number', ac: 'tel' });
        if (c.askComment) fields.push({ name: 'comment', multiline: true, ph: 'Comment (optional)' });
        card.appendChild(form(fields, function () { done(card); }));
        wrap.insertBefore(card, pill);
        var first = card.querySelector('input'); if (first) first.focus();
        track('widget-open', { id: w.id, type: w.type });
      });
      wrap.appendChild(pill);
    } else if (w.type === 'popup' || w.type === 'email') {
      var overlay = w.type === 'popup' && c.position === 'center';
      if (overlay) wrap.className += ' overlay';
      else wrap.className += ' ' + (c.position === 'bottom-left' ? 'bl' : 'br');
      var pc = el('div', { class: 'card', role: 'dialog', 'aria-label': c.title || 'Offer' });
      if (c.dismissible) pc.appendChild(closeBtn());
      var img = safeUrl(c.imageUrl);
      if (img) pc.appendChild(el('img', { src: img, alt: '' }));
      if (c.title) pc.appendChild(el('h3', { text: iconText + c.title }));
      if (c.text) pc.appendChild(el('p', { text: c.text }));
      if (c.promoCode) {
        var cp = el('button', { type: 'button', text: 'Copy' });
        cp.addEventListener('click', function () {
          try { navigator.clipboard.writeText(c.promoCode); cp.textContent = 'Copied'; } catch (e) {}
        });
        pc.appendChild(el('div', { class: 'promo' }, [el('span', { text: c.promoCode }), cp]));
      }
      if (w.type === 'email') {
        pc.appendChild(form([{ name: 'email', type: 'email', ph: c.placeholder || 'you@example.com', ac: 'email' }], function () { done(pc); }));
      } else {
        var pl = link(c.buttonText, c.buttonUrl, 'full');
        if (pl) pc.appendChild(pl);
      }
      wrap.appendChild(pc);
      if (overlay) {
        wrap.addEventListener('click', function (e) { if (e.target === wrap && c.dismissible) close(); });
      }
    }

    var corner = /(^|\s)(bl|br)(\s|$)/.exec(wrap.className);
    if (corner) host.setAttribute('data-corner', corner[2]);

    wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape' && c.dismissible !== false) close(); });
    document.body.appendChild(host);
    if (corner) {
      // Stack corner widgets instead of overlapping them.
      var off = 16;
      var peers = document.querySelectorAll('[data-umami-widget][data-corner="' + corner[2] + '"]');
      for (var i = 0; i < peers.length; i++) {
        if (peers[i] === host) continue;
        var pw = peers[i].shadowRoot && peers[i].shadowRoot.querySelector('.w');
        if (pw) off += pw.offsetHeight + 12;
      }
      wrap.style.bottom = off + 'px';
    }
    if (w.type !== 'callback') markSeen(w);
    track('widget-shown', { id: w.id, type: w.type });
    if (preview && preview.open && pillEl) pillEl.click();
  }

  function schedule(w, c) {
    var fire = function () { if (!document.querySelector('[data-umami-widget="' + w.id + '"]')) mount(w, c); };
    var t = c.trigger;
    var touch = 'ontouchstart' in window;
    if (t === 'exit' && touch) t = 'delay';
    var go = function () {
      if (t === 'delay') setTimeout(fire, Math.max(0, c.delaySec) * 1000);
      else if (t === 'scroll') {
        var onScroll = function () {
          var h = document.documentElement;
          var pct = (window.scrollY / Math.max(1, h.scrollHeight - window.innerHeight)) * 100;
          if (pct >= c.scrollPct) { window.removeEventListener('scroll', onScroll); fire(); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      } else if (t === 'exit') {
        var onOut = function (e) {
          if (e.clientY <= 0) { document.removeEventListener('mouseout', onOut); fire(); }
        };
        document.addEventListener('mouseout', onOut);
      } else fire();
    };
    // "Engaged visitor" gate: wait until enough time has passed since the session began.
    var wait = preview ? 0 : Math.max(0, c.minTimeSec * 1000 - visit.sessionMs);
    if (wait > 0) setTimeout(go, wait); else go();
  }

  function start(items) {
    (items || []).forEach(function (w) {
      if (!w || !w.config) return;
      var c = evaluate(w);
      if (!c || !canShow(w, c)) return;
      schedule(w, c);
    });
  }

  function init() {
    if (preview) return start(preview.widgets);
    fetch(base + '/api/w/' + website, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : { widgets: [] }; })
      .then(function (d) { start(d.widgets); })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
