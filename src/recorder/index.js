import { record } from 'rrweb';

(window => {
  const { document } = window;
  const { currentScript } = document;
  if (!currentScript) return;

  const globalConfig = window.umamiConfig || {};
  const _data = 'data-';
  const attr = currentScript.getAttribute.bind(currentScript);
  const toCamelCase = str => str.replace(/-([a-z])/g, g => g[1].toUpperCase());
  const config = value => {
    const camelKey = toCamelCase(value);
    if (globalConfig[camelKey] != null) {
      const v = globalConfig[camelKey];
      return Array.isArray(v) ? v.join(',') : String(v);
    }
    return attr(`${_data}${value}`);
  };

  const website = config(`website-id`);
  const hostUrl = config(`host-url`);

  if (!website) return;

  const host =
    hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -1).join('/');
  const hostBase = host.replace(/\/$/, '');
  const endpoint = `${hostBase}__COLLECT_REPLAY_ENDPOINT__`;
  const configEndpoint = `${hostBase}__RECORDER_CONFIG_ENDPOINT__`.replace(
    '{websiteId}',
    website,
  );

  const FLUSH_EVENT_COUNT = 100;
  const FLUSH_INTERVAL = 10000;

  let sampleRate = 0.15;
  let maskLevel = 'moderate';
  let maxDuration = 300000;
  let blockSelector = '';

  let eventBuffer = [];
  let stopFn = null;
  let flushTimer = null;
  let startTime = null;
  let stopped = false;
  let recorderReady = false;
  let customEventBuffer = [];

  const sendEvents = (events, useKeepalive = false) => {
    const session = window.umami?.getSession?.();
    if (!session?.cache) return;

    const body = JSON.stringify({
      type: 'record',
      payload: {
        website,
        events,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });

    // keepalive has a 64KB body limit — only use it for small payloads on unload
    const keepalive = useKeepalive && body.length < 60000;

    return fetch(endpoint, {
      keepalive,
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-umami-cache': session.cache,
      },
      credentials: 'omit',
    }).catch(() => {});
  };

  const flush = (useKeepalive = false) => {
    if (!eventBuffer.length) return;

    const events = eventBuffer;
    eventBuffer = [];

    sendEvents(events, useKeepalive);
  };

  const scheduleFlush = () => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, FLUSH_INTERVAL);
  };

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (flushTimer) clearTimeout(flushTimer);
    flush();
    if (stopFn) stopFn();
  };

  const flushCustomEvents = () => {
    if (!recorderReady || !customEventBuffer.length) return;

    const events = customEventBuffer;
    customEventBuffer = [];

    for (const event of events) {
      addCustomEvent(event.tag, event.payload);
    }
  };

  const addCustomEvent = (tag, payload) => {
    if (stopped) return;

    if (!recorderReady) {
      customEventBuffer.push({ tag, payload });
      return;
    }

    try {
      record.addCustomEvent(tag, payload);
    } catch (e) {
      if (e?.message === 'please add custom event after start recording') {
        recorderReady = false;
        customEventBuffer.push({ tag, payload });
        setTimeout(() => {
          recorderReady = true;
          flushCustomEvents();
        }, 0);
        return;
      }

      throw e;
    }
  };

  const getMaskConfig = level => {
    switch (level) {
      case 'strict':
        return {
          maskAllInputs: true,
          maskTextSelector: '*',
        };
      default: // moderate
        return {
          maskAllInputs: true,
        };
    }
  };

  const waitForSession = (attempts = 0) => {
    if (attempts > 50) return;

    const session = window.umami?.getSession?.();
    if (session?.cache) {
      beginRecording();
    } else {
      setTimeout(() => waitForSession(attempts + 1), 100);
    }
  };

  const beginRecording = () => {
    startTime = Date.now();

    const maskConfig = getMaskConfig(maskLevel);

    stopFn = record({
      emit(event) {
        if (stopped) return;

        if (Date.now() - startTime > maxDuration) {
          stop();
          return;
        }

        eventBuffer.push(event);
        recorderReady = true;
        flushCustomEvents();

        if (eventBuffer.length >= FLUSH_EVENT_COUNT) {
          flush();
        }

        scheduleFlush();
      },
      ...maskConfig,
      inlineStylesheet: true,
      slimDOMOptions: {
        script: true,
        comment: true,
        headMetaDescKeywords: true,
        headMetaSocial: true,
        headMetaRobots: true,
        headMetaHttpEquiv: true,
        headMetaAuthorship: true,
        headMetaVerification: true,
      },
      recordCanvas: false,
      recordCrossOriginIframes: false,
      checkoutEveryNms: 30000,
      ...(blockSelector && { blockSelector }),
    });
    recorderReady = true;
    flushCustomEvents();

    let scrollUrl = location.href;
    let maxScrollPct = 0;
    let scrollTimer = null;

    const computeScrollPct = () => {
      const pageH = document.documentElement.scrollHeight;
      const visible = window.scrollY + window.innerHeight;
      return {
        pct: Math.max(0, Math.min(100, Math.round((visible / Math.max(1, pageH)) * 100))),
        pageH,
      };
    };

    const flushScroll = () => {
      if (maxScrollPct <= 0) return;
      addCustomEvent('scroll-progress', {
        url: scrollUrl,
        scrollPct: maxScrollPct,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        pageH: document.documentElement.scrollHeight,
      });
      maxScrollPct = 0;
    };

    const onScroll = () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        const { pct } = computeScrollPct();
        if (pct > maxScrollPct) maxScrollPct = pct;
        scrollTimer = null;
      }, 200);
    };

    const onUrlChange = () => {
      if (location.href === scrollUrl) return;
      flushScroll();
      scrollUrl = location.href;
      addCustomEvent('url-change', { url: scrollUrl });
    };

    const hookHistory = method => {
      const orig = history[method];
      history[method] = function (...args) {
        const result = orig.apply(this, args);
        onUrlChange();
        return result;
      };
    };

    hookHistory('pushState');
    hookHistory('replaceState');
    window.addEventListener('popstate', onUrlChange);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Capture initial scroll position
    {
      const { pct } = computeScrollPct();
      if (pct > maxScrollPct) maxScrollPct = pct;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushScroll();
        flush(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      flushScroll();
      flush(true);
    });
  };

  const bootstrap = async () => {
    try {
      const response = await fetch(configEndpoint, { credentials: 'omit' });
      if (!response.ok) return;

      const data = await response.json();
      if (!data?.enabled) return;

      if (typeof data.sampleRate === 'number') sampleRate = data.sampleRate;
      if (typeof data.maskLevel === 'string') maskLevel = data.maskLevel;
      if (typeof data.maxDuration === 'number') maxDuration = data.maxDuration;
      if (typeof data.blockSelector === 'string') blockSelector = data.blockSelector;
    } catch {
      return;
    }

    // Sample rate check
    if (sampleRate < 1 && Math.random() > sampleRate) return;

    if (document.readyState === 'complete') {
      waitForSession();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') waitForSession();
      });
    }
  };

  bootstrap();
})(window);
