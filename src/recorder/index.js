import { record } from 'rrweb';

(window => {
  const { document } = window;
  const { currentScript } = document;

  if (!currentScript) return;

  const _data = 'data-';
  const attr = currentScript.getAttribute.bind(currentScript);
  const config = value => attr(`${_data}${value}`);

  const website = config('website-id');
  const hostUrl = config('host-url');

  if (!website) return;

  const host =
    hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -1).join('/');
  const hostBase = host.replace(/\/$/, '');
  const endpoint = `${hostBase}__COLLECT_REPLAY_ENDPOINT__`;
  const configEndpoint = `${hostBase}__RECORDER_CONFIG_ENDPOINT__`.replace('{websiteId}', website);

  const REPLAY_FLUSH_EVENT_COUNT = 100;
  const REPLAY_FLUSH_INTERVAL = 10000;
  const HEATMAP_FLUSH_EVENT_COUNT = 20;
  const HEATMAP_FLUSH_INTERVAL = 5000;

  let replayEnabled = false;
  let heatmapEnabled = false;
  let sampleRate = 0.15;
  let heatmapSampleRate = 0.15;
  let maskLevel = 'moderate';
  let maxDuration = 300000;
  let blockSelector = '';

  let replayBuffer = [];
  let heatmapBuffer = [];
  let replayStopFn = null;
  let replayFlushTimer = null;
  let heatmapFlushTimer = null;
  let replayStartTime = null;
  let replayStopped = false;
  let heatmapStarted = false;

  const getSessionCache = () => window.umami?.getSession?.()?.cache;

  const sendPayload = (type, payload, useKeepalive = false) => {
    const cache = getSessionCache();

    if (!cache) return;

    const body = JSON.stringify({
      type,
      payload: {
        website,
        ...payload,
      },
    });

    const keepalive = useKeepalive && body.length < 60000;

    return fetch(endpoint, {
      keepalive,
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-umami-cache': cache,
      },
      credentials: 'omit',
    }).catch(() => {});
  };

  const flushReplay = (useKeepalive = false) => {
    if (!replayBuffer.length) return;

    const events = replayBuffer;
    replayBuffer = [];

    sendPayload(
      'record',
      {
        events,
        timestamp: Math.floor(Date.now() / 1000),
      },
      useKeepalive,
    );
  };

  const flushHeatmap = (useKeepalive = false) => {
    if (!heatmapBuffer.length) return;

    const events = heatmapBuffer;
    heatmapBuffer = [];

    sendPayload(
      'heatmap',
      {
        events,
        timestamp: Math.floor(Date.now() / 1000),
      },
      useKeepalive,
    );
  };

  const scheduleReplayFlush = () => {
    if (replayFlushTimer) clearTimeout(replayFlushTimer);
    replayFlushTimer = setTimeout(() => flushReplay(), REPLAY_FLUSH_INTERVAL);
  };

  const scheduleHeatmapFlush = () => {
    if (heatmapFlushTimer) clearTimeout(heatmapFlushTimer);
    heatmapFlushTimer = setTimeout(() => flushHeatmap(), HEATMAP_FLUSH_INTERVAL);
  };

  const queueHeatmapEvent = event => {
    heatmapBuffer.push({
      ...event,
      timestamp: Date.now(),
    });

    if (heatmapBuffer.length >= HEATMAP_FLUSH_EVENT_COUNT) {
      flushHeatmap();
      return;
    }

    scheduleHeatmapFlush();
  };

  const stopReplay = () => {
    if (replayStopped) return;

    replayStopped = true;

    if (replayFlushTimer) clearTimeout(replayFlushTimer);
    flushReplay();

    if (replayStopFn) {
      replayStopFn();
      replayStopFn = null;
    }
  };

  const getMaskConfig = level => {
    switch (level) {
      case 'strict':
        return {
          maskAllInputs: true,
          maskTextSelector: '*',
        };
      default:
        return {
          maskAllInputs: true,
        };
    }
  };

  const shouldSample = value => {
    if (value >= 1) return true;
    if (value <= 0) return false;

    return Math.random() <= value;
  };

  const measureElementWidth = element => {
    if (!element) return 0;

    const rect = element.getBoundingClientRect?.();

    return Math.max(
      element.scrollWidth || 0,
      element.offsetWidth || 0,
      element.clientWidth || 0,
      rect?.width || 0,
    );
  };

  const measureElementHeight = element => {
    if (!element) return 0;

    const rect = element.getBoundingClientRect?.();

    return Math.max(
      element.scrollHeight || 0,
      element.offsetHeight || 0,
      element.clientHeight || 0,
      rect?.height || 0,
    );
  };

  const measureDocumentBounds = doc => {
    const body = doc?.body;

    if (!body) {
      return { width: 0, height: 0 };
    }

    let maxRight = 0;
    let maxBottom = 0;
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;

    while (node) {
      const rect = node.getBoundingClientRect?.();

      if (rect && (rect.width > 0 || rect.height > 0)) {
        maxRight = Math.max(maxRight, rect.right);
        maxBottom = Math.max(maxBottom, rect.bottom);
      }

      node = walker.nextNode();
    }

    return {
      width: Math.max(0, Math.round(maxRight)),
      height: Math.max(0, Math.round(maxBottom)),
    };
  };

  const createPageMetrics = () => {
    const computePageMetrics = ({ includeBounds = false } = {}) => {
      const scrollingElement = document.scrollingElement || document.documentElement;
      const firstChild = document.body?.firstElementChild;
      const bounds = includeBounds ? measureDocumentBounds(document) : null;
      const pageW = Math.max(
        bounds?.width || 0,
        measureElementWidth(scrollingElement),
        measureElementWidth(document.documentElement),
        measureElementWidth(document.body),
        measureElementWidth(firstChild),
      );
      const pageH = Math.max(
        bounds?.height || 0,
        measureElementHeight(scrollingElement),
        measureElementHeight(document.documentElement),
        measureElementHeight(document.body),
        measureElementHeight(firstChild),
      );
      const scrollLeft = scrollingElement?.scrollLeft || window.scrollX || 0;
      const scrollTop = scrollingElement?.scrollTop || window.scrollY || 0;

      return {
        pageW,
        pageH,
        scrollLeft,
        scrollTop,
      };
    };

    const computeScrollPct = () => {
      const { pageH, scrollTop } = computePageMetrics();
      const visible = scrollTop + window.innerHeight;

      return {
        pct: Math.max(0, Math.min(100, Math.round((visible / Math.max(1, pageH)) * 100))),
        pageH,
      };
    };

    return {
      computePageMetrics,
      computeScrollPct,
    };
  };

  const beginReplayCapture = () => {
    replayStartTime = Date.now();

    replayStopFn = record({
      emit(event) {
        if (replayStopped) return;

        if (Date.now() - replayStartTime > maxDuration) {
          stopReplay();
          return;
        }

        replayBuffer.push(event);

        if (replayBuffer.length >= REPLAY_FLUSH_EVENT_COUNT) {
          flushReplay();
        }

        scheduleReplayFlush();
      },
      ...getMaskConfig(maskLevel),
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
  };

  const beginHeatmapCapture = () => {
    if (heatmapStarted) return;

    heatmapStarted = true;

    const { computePageMetrics, computeScrollPct } = createPageMetrics();
    let scrollUrl = location.href;
    let maxScrollPct = 0;
    let lastFlushedScrollPct = 0;
    let scrollTimer = null;

    const flushScroll = () => {
      if (maxScrollPct <= 0 || maxScrollPct <= lastFlushedScrollPct) return;

      const { pageW, pageH } = computePageMetrics({ includeBounds: true });

      queueHeatmapEvent({
        type: 'scroll',
        url: scrollUrl,
        scrollPct: maxScrollPct,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
        pageW,
        pageH,
      });

      lastFlushedScrollPct = maxScrollPct;
      maxScrollPct = 0;
    };

    const onClick = event => {
      if (!event.isTrusted || event.button !== 0) return;

      const {
        pageW: rawPageW,
        pageH: rawPageH,
        scrollLeft,
        scrollTop,
      } = computePageMetrics({
        includeBounds: true,
      });
      const pageX = Number.isFinite(event.pageX) ? event.pageX : event.clientX + scrollLeft;
      const pageY = Number.isFinite(event.pageY) ? event.pageY : event.clientY + scrollTop;
      const target = event.target;
      const targetRect =
        target && typeof target.getBoundingClientRect === 'function'
          ? target.getBoundingClientRect()
          : null;
      const targetRight = targetRect ? targetRect.right + scrollLeft : 0;
      const targetBottom = targetRect ? targetRect.bottom + scrollTop : 0;
      const pageW = Math.max(rawPageW, Math.ceil(pageX), Math.ceil(targetRight));
      const pageH = Math.max(rawPageH, Math.ceil(pageY), Math.ceil(targetBottom));

      queueHeatmapEvent({
        type: 'click',
        url: location.href,
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        pageX: Math.round(pageX),
        pageY: Math.round(pageY),
        pageW,
        pageH,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
      });
    };

    const onScroll = () => {
      if (scrollTimer) return;

      scrollTimer = setTimeout(() => {
        const { pct } = computeScrollPct();

        if (pct > maxScrollPct) {
          maxScrollPct = pct;
        }

        flushScroll();
        scrollTimer = null;
      }, 400);
    };

    const onUrlChange = () => {
      if (location.href === scrollUrl) return;

      flushScroll();
      scrollUrl = location.href;
      lastFlushedScrollPct = 0;
    };

    const hookHistory = method => {
      const original = history[method];

      history[method] = function (...args) {
        const result = original.apply(this, args);
        onUrlChange();
        return result;
      };
    };

    hookHistory('pushState');
    hookHistory('replaceState');
    window.addEventListener('popstate', onUrlChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, { capture: true, passive: true });

    {
      const { pct } = computeScrollPct();

      if (pct > maxScrollPct) {
        maxScrollPct = pct;
      }

      flushScroll();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushScroll();
        flushHeatmap(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      flushScroll();
      flushHeatmap(true);
    });
  };

  const waitForSession = (callback, attempts = 0) => {
    if (attempts > 50) return;

    if (getSessionCache()) {
      callback();
      return;
    }

    setTimeout(() => waitForSession(callback, attempts + 1), 100);
  };

  const startCaptures = () => {
    const shouldRecordReplay = replayEnabled && shouldSample(sampleRate);
    const shouldRecordHeatmap = heatmapEnabled && shouldSample(heatmapSampleRate);

    if (shouldRecordHeatmap) {
      beginHeatmapCapture();
    }

    if (shouldRecordReplay) {
      beginReplayCapture();
    }

    if (!shouldRecordHeatmap && !shouldRecordReplay) {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushReplay(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      flushReplay(true);
    });
  };

  const bootstrap = async () => {
    try {
      const response = await fetch(configEndpoint, { credentials: 'omit' });

      if (!response.ok) return;

      const data = await response.json();

      if (!data?.enabled) return;

      replayEnabled = data.replayEnabled === true;
      heatmapEnabled = data.heatmapEnabled === true;

      if (typeof data.sampleRate === 'number') sampleRate = data.sampleRate;
      if (typeof data.heatmapSampleRate === 'number') heatmapSampleRate = data.heatmapSampleRate;
      if (typeof data.maskLevel === 'string') maskLevel = data.maskLevel;
      if (typeof data.maxDuration === 'number') maxDuration = data.maxDuration;
      if (typeof data.blockSelector === 'string') blockSelector = data.blockSelector;
    } catch {
      return;
    }

    if (!replayEnabled && !heatmapEnabled) {
      return;
    }

    if (document.readyState === 'complete') {
      waitForSession(startCaptures);
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          waitForSession(startCaptures);
        }
      });
    }
  };

  bootstrap();
})(window);
