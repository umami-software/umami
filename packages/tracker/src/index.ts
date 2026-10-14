import { createErrorCollector, type ErrorCaptureOptions } from './errors';

export type { ErrorCaptureOptions } from './errors';

/** Public types for the browser tracker. */
export type TrackedProperties = {
  /**
   * Hostname of server
   *
   * @description extracted from `window.location.hostname`
   * @example 'analytics.umami.is'
   */
  hostname?: string;

  /** Distinct ID associated with the current visitor. */
  id?: string;

  /**
   * Browser language
   *
   * @description extracted from `window.navigator.language`
   * @example 'en-US', 'fr-FR'
   */
  language?: string;

  /**
   * Page referrer
   *
   * @description extracted from `document.referrer`
   * @example 'https://analytics.umami.is/docs/getting-started'
   */
  referrer?: string;

  /**
   * Screen dimensions
   *
   * @description extracted from `window.screen.width` and `window.screen.height`
   * @example '1920x1080', '2560x1440'
   */
  screen?: string;

  /** Tag configured on the tracker script. */
  tag?: string;

  /**
   * Page title
   *
   * @description extracted from `document.querySelector('head > title')`
   * @example 'umami'
   */
  title?: string;

  /**
   * Page url
   *
   * @description normalized from `window.location.href`
   * @example 'https://analytics.umami.is/docs/getting-started'
   */
  url?: string;

  /**
   * Website ID (required)
   *
   * @example 'b59e9c65-ae32-47f1-8400-119fcf4861c4'
   */
  website: string;
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type EventDataValue = boolean | number | string | null | EventData | EventDataValue[];

/**
 *
 * Event Data can work with any JSON data. There are a few rules in place to maintain performance.
 * - Numbers have a max precision of 4.
 * - Strings have a max length of 500.
 * - Arrays are converted to a String, with the same max length of 500.
 * - Objects have a max of 50 properties. Arrays are considered 1 property.
 */
export interface EventData {
  [key: string]: EventDataValue | undefined;
}

export type EventProperties = {
  /**
   * NOTE: event names will be truncated past 50 characters
   */
  name: string;
  data?: EventData;
} & WithRequired<TrackedProperties, 'website'>;
export type PageViewProperties = WithRequired<TrackedProperties, 'website'>;
export type CustomEventFunction = (
  props: PageViewProperties,
) => EventProperties | PageViewProperties;

export type UmamiTracker = {
  /** Capture an exception when error tracking is enabled. Never throws. */
  captureException: (error: unknown, options?: ErrorCaptureOptions) => Promise<void>;
  track: {
    /**
     * Track a page view
     *
     * @example ```
     * umami.track();
     * ```
     */
    (): Promise<void>;

    /**
     * Track an event with a given name
     *
     * NOTE: event names will be truncated past 50 characters
     *
     * @example ```
     * umami.track('signup-button');
     * ```
     */
    (eventName: string): Promise<void>;

    /**
     * Tracks an event with dynamic data.
     *
     * NOTE: event names will be truncated past 50 characters
     *
     * When tracking events, the default properties are included in the payload. This is equivalent to running:
     *
     * ```js
     * umami.track(props => ({
     *   ...props,
     *   name: 'signup-button',
     *   data: {
     *     name: 'newsletter',
     *     id: 123
     *   }
     * }));
     * ```
     *
     * @example ```
     * umami.track('signup-button', { name: 'newsletter', id: 123 });
     * ```
     */
    (eventName: string, obj: EventData): Promise<void>;

    /**
     * Tracks a page view with custom properties
     *
     * @example ```
     * umami.track({ website: 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2', url: '/home', title: 'Home page' });
     * ```
     */
    (properties: PageViewProperties): Promise<void>;

    /**
     * Tracks an event with fully customizable dynamic data
     * If you don't specify any `name` and/or `data`, it will be treated as a page view
     *
     * @example ```
     * umami.track((props) => ({ ...props, url: path }));
     * ```
     */
    (eventFunction: CustomEventFunction): Promise<void>;
  };
  identify: {
    /**
     * Identify a visitor with optional associated data.
     *
     * @example ```
     * umami.identify('user-123', { plan: 'pro' });
     * ```
     */
    (id: string, data?: EventData): Promise<void>;

    /**
     * Associate data with the current visitor. An `id` string sets the Distinct ID.
     *
     * @example ```
     * umami.identify({ id: 'user-123', plan: 'pro' });
     * ```
     */
    (data: EventData & { id?: string }): Promise<void>;
  };
  getSession: () => {
    cache: string | undefined;
    website: string | null;
  };
};

export type BeforeSend = (
  type: string,
  payload: Record<string, unknown>,
) =>
  | Record<string, unknown>
  | null
  | undefined
  | Promise<Record<string, unknown> | null | undefined>;

/** Tracker options. Names match `window.umamiConfig` of the tracker script. */
export type TrackerConfig = {
  websiteId: string;
  /** Full collect URL, e.g. `https://analytics.example.com/api/send`. */
  endpoint: string;
  /** Track the initial page view, history changes and `data-umami-event` clicks. @default true */
  autoTrack?: boolean;
  /** Send page views for automatically tracked navigation. @default true */
  autoPageview?: boolean;
  /** Honor the browser's Do Not Track setting. @default false */
  doNotTrack?: boolean;
  excludeSearch?: boolean;
  excludeHash?: boolean;
  /** Only track on these hostnames. Empty tracks everywhere. */
  domains?: string[];
  tag?: string;
  distinctId?: string;
  /** Modify a payload before it is sent. Return a falsy value to drop it. */
  beforeSend?: BeforeSend;
  /** Capture uncaught errors and unhandled rejections. @default false */
  errors?: boolean;
  release?: string;
  /** @default 'production' */
  environment?: string;
  /** Collect web vitals. @default false */
  performance?: boolean;
  /** @default 'omit' */
  fetchCredentials?: RequestCredentials;
};

type Payload = Record<string, unknown>;
type TrackerWindow = Window &
  typeof globalThis & {
    doNotTrack?: string | number | null;
    navigator: Navigator & {
      msDoNotTrack?: string | number | null;
    };
  };
type MetricEntry = PerformanceEntry & {
  activationStart: number;
  duration: number;
  hadRecentInput: boolean;
  interactionId: number;
  responseStart: number;
  startTime: number;
  value: number;
};
export function createTracker(options: TrackerConfig): UmamiTracker {
  const {
    websiteId: website,
    endpoint,
    autoTrack = true,
    autoPageview = true,
    doNotTrack: dnt = false,
    excludeSearch = false,
    excludeHash = false,
    domains = [],
    tag,
    distinctId,
    beforeSend,
    errors = false,
    release = '',
    environment = 'production',
    performance: perf = false,
    fetchCredentials: credentials = 'omit',
  } = options;
  const {
    screen: { width, height },
    navigator: { language, doNotTrack: ndnt, msDoNotTrack: msdnt },
    location,
    document,
    history,
    top,
    doNotTrack,
  } = window as TrackerWindow;
  const { referrer } = document;

  const { hostname, href, origin } = location;

  let localStorage: Storage | undefined;
  try {
    localStorage = href.startsWith('data:') ? undefined : window.localStorage;
  } catch {
    /* (DOMException) SecurityError: Access is denied for this document. */
  }

  const _data = 'data-';
  const screen = `${width}x${height}`;
  const eventRegex = /data-umami-event-([\w-_]+)/;
  const eventNameAttribute = `${_data}umami-event`;
  const delayDuration = 300;

  /* Helper functions */

  const normalize = (raw: string | URL): string => {
    if (!raw) return raw as string;
    try {
      const u = new URL(raw, location.href);
      if (excludeSearch) u.search = '';
      if (excludeHash) u.hash = '';
      return u.toString();
    } catch {
      return raw as string;
    }
  };

  // Strip the origin from same-origin referrers so the referrer domain
  // is never saved when it matches the current hostname
  const stripOrigin = (url: string): string =>
    url === origin || url?.startsWith(`${origin}/`) ? url.slice(origin.length) : url;

  const getPayload = () => ({
    website,
    screen,
    language,
    title: document.title,
    hostname,
    url: currentUrl,
    referrer: stripOrigin(currentRef),
    tag,
    id: identity ? identity : undefined,
  });

  const hasDoNotTrack = () => {
    const dnt = doNotTrack || ndnt || msdnt;
    return dnt === 1 || dnt === '1' || dnt === 'yes';
  };

  /* Event handlers */

  const handlePush = (_state: unknown, _title: string, url?: string | URL | null) => {
    if (!url) return;

    if (typeof flushPerformance === 'function') {
      flushPerformance();
    }

    currentRef = currentUrl;
    currentUrl = normalize(url);

    if (currentUrl !== currentRef && autoPageview) {
      setTimeout(track, delayDuration);
    }
  };

  const handlePathChanges = () => {
    const hook = (
      _this: History,
      method: 'pushState' | 'replaceState',
      callback: typeof handlePush,
    ) => {
      const orig = _this[method];
      return (...args: Parameters<History['pushState']>) => {
        const result = orig.apply(_this, args);
        callback.apply(null, args);
        return result;
      };
    };

    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);
  };

  const handleClicks = () => {
    const trackElement = async (el: Element) => {
      const eventName = el.getAttribute(eventNameAttribute);
      if (eventName) {
        const eventData: EventData = {};

        el.getAttributeNames().forEach(name => {
          const match = name.match(eventRegex);
          if (match) eventData[match[1]] = el.getAttribute(name) as string;
        });

        return track(eventName, eventData);
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el || typeof el.closest !== 'function') return;
      const eventEl = el.closest(`[${eventNameAttribute}]`);
      if (!eventEl) return;

      if (eventEl.tagName === 'A' && (eventEl as HTMLAnchorElement).href) {
        const { href, target } = eventEl as HTMLAnchorElement;
        const external =
          target === '_blank' ||
          e.ctrlKey ||
          e.shiftKey ||
          e.metaKey ||
          (e.button && e.button === 1);
        if (!external) e.preventDefault();
        return trackElement(eventEl).finally(() => {
          if (!external) {
            (target === '_top' ? (top as WindowProxy).location : location).href = href;
          }
        });
      }

      return trackElement(eventEl);
    };
    document.addEventListener('click', onClick, true);
  };

  /* Tracking functions */

  const trackingDisabled = () =>
    disabled ||
    !website ||
    localStorage?.getItem('umami.disabled') ||
    (window.name === 'umami.disabled' && top !== window) ||
    (domains.length && !domains.includes(hostname)) ||
    (dnt && hasDoNotTrack());

  const send = async (payload: Payload | null | undefined, type = 'event'): Promise<void> => {
    if (trackingDisabled()) return;

    if (typeof beforeSend === 'function') {
      // Called a tick later, so the caller can expose the tracker (as window.umami) beforehand.
      payload = await Promise.resolve().then(() => beforeSend(type, payload as Payload));
    }

    if (!payload) return;

    try {
      const res = await fetch(endpoint, {
        keepalive: true,
        method: 'POST',
        body: JSON.stringify({ type, payload }),
        headers: {
          'Content-Type': 'application/json',
          'x-umami-website-id': website as string,
          'x-umami-hostname': hostname,
          ...(typeof cache !== 'undefined' && { 'x-umami-cache': cache }),
        },
        credentials,
      });

      const data = (await res.json()) as { cache?: string; disabled?: boolean } | null;
      if (data) {
        disabled = !!data.disabled;
        cache = data.cache;
      }
    } catch {}
  };

  const init = () => {
    if (!initialized) {
      initialized = true;
      if (autoPageview) track();
      handlePathChanges();
      handleClicks();
      if (perf) initPerformance();
    }
  };

  const track = (
    name?: string | Payload | ((payload: Payload) => Payload),
    data?: EventData,
  ): Promise<void> => {
    if (typeof name === 'string') return send({ ...getPayload(), name, data });
    if (typeof name === 'object') return send({ ...name });
    if (typeof name === 'function') return send(name(getPayload()));
    return send(getPayload());
  };

  const identify = (
    id: string | (EventData & { id?: string }),
    data?: EventData,
  ): Promise<void> => {
    const nextIdentity = typeof id === 'string' ? id : id.id;

    if (nextIdentity !== undefined) {
      identity = nextIdentity;
    }

    return send(
      {
        ...getPayload(),
        data: typeof id === 'object' ? id : data,
      },
      'identify',
    );
  };

  /* Performance */

  const initPerformance = () => {
    const metrics: Record<string, number> = {};
    let sent = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isInitialLoad = true;
    let activationStart = 0;
    let pageStartTime = 0;

    const observe = (type: string, callback: (entry: MetricEntry) => void) => {
      try {
        const observer = new PerformanceObserver(list => {
          (list.getEntries() as MetricEntry[]).forEach(callback);
        });
        observer.observe({ type, buffered: true });
      } catch {
        /* not supported */
      }
    };

    // TTFB
    observe('navigation', entry => {
      activationStart = entry.activationStart || 0;
      metrics.ttfb = Math.max(entry.responseStart - activationStart, 0);
    });

    // FCP
    observe('paint', entry => {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = Math.max(entry.startTime - activationStart, 0);
      }
    });

    // LCP
    observe('largest-contentful-paint', entry => {
      metrics.lcp = Math.max(entry.startTime - activationStart, 0);
    });

    // CLS - session windows algorithm (gap < 1s, max 5s duration; report worst window)
    let clsSessionValue = 0;
    let clsSessionEntries: MetricEntry[] = [];
    observe('layout-shift', entry => {
      if (!entry.hadRecentInput) {
        const lastEntry = clsSessionEntries[clsSessionEntries.length - 1];
        const firstEntry = clsSessionEntries[0];
        if (
          lastEntry &&
          entry.startTime - lastEntry.startTime - lastEntry.duration < 1000 &&
          entry.startTime - firstEntry.startTime < 5000
        ) {
          clsSessionValue += entry.value;
          clsSessionEntries.push(entry);
        } else {
          clsSessionValue = entry.value;
          clsSessionEntries = [entry];
        }
        if (clsSessionValue > (metrics.cls || 0)) {
          metrics.cls = clsSessionValue;
        }
      }
    });

    // INP - group by interactionId, 98th percentile, 40ms threshold
    let interactions: Record<number, number> = {};
    let inpObserver: PerformanceObserver | undefined;
    const recordInteractions = (entries: PerformanceEntryList) => {
      (entries as MetricEntry[]).forEach(entry => {
        if (entry.interactionId) {
          const existing = interactions[entry.interactionId];
          if (!existing || entry.duration > existing) {
            interactions[entry.interactionId] = entry.duration;
          }
        }
      });
    };
    try {
      inpObserver = new PerformanceObserver(list => recordInteractions(list.getEntries()));
      inpObserver.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 40,
      } as PerformanceObserverInit);
    } catch {
      /* not supported */
    }

    const computeInp = () => {
      if (inpObserver) recordInteractions(inpObserver.takeRecords());
      const values = Object.values(interactions).sort((a, b) => b - a);
      if (values.length) {
        const p98Index = Math.floor(Math.max(values.length, 10) * 0.02);
        metrics.inp = values[Math.min(p98Index, values.length - 1)];
      }
    };

    const getEntriesByType = (type: string): MetricEntry[] => {
      try {
        return (window.performance?.getEntriesByType?.(type) as MetricEntry[]) || [];
      } catch {
        return [];
      }
    };

    const applyFallbackMetrics = () => {
      if (!isInitialLoad) return;

      if (metrics.ttfb === undefined) {
        const navigation = getEntriesByType('navigation')?.[0];
        if (navigation) {
          metrics.ttfb = Math.max(navigation.responseStart - (navigation.activationStart || 0), 0);
        }
      }

      if (metrics.fcp === undefined) {
        const fcpEntry = getEntriesByType('paint')?.find(
          entry => entry.name === 'first-contentful-paint',
        );
        if (fcpEntry) {
          metrics.fcp = Math.max(fcpEntry.startTime - activationStart, 0);
        }
      }

      if (metrics.lcp === undefined) {
        const lcpEntries = getEntriesByType('largest-contentful-paint');
        const lcpEntry = lcpEntries?.[lcpEntries.length - 1];
        if (lcpEntry) {
          metrics.lcp = Math.max(lcpEntry.startTime - activationStart, 0);
        }
      }
    };

    const sendPerformance = () => {
      if (sent) return;

      applyFallbackMetrics();
      computeInp();
      metrics.duration = Math.round(performance.now() - pageStartTime);

      sent = true;
      if (timeoutId) clearTimeout(timeoutId);
      send({ ...getPayload(), ...metrics }, 'performance');
    };

    flushPerformance = () => {
      sendPerformance();
      isInitialLoad = false;
      Object.keys(metrics).forEach(k => {
        delete metrics[k];
      });
      activationStart = 0;
      pageStartTime = performance.now();
      clsSessionValue = 0;
      clsSessionEntries = [];
      interactions = {};
      sent = false;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(sendPerformance, 10000);
    };
    timeoutId = setTimeout(sendPerformance, 10000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendPerformance();
    });
    window.addEventListener('pagehide', sendPerformance);
  };

  /* Start */

  let currentUrl = normalize(href);
  let currentRef = normalize(referrer);

  let initialized = false;
  let disabled = false;
  let cache: string | undefined;
  let identity = distinctId;
  let flushPerformance: (() => void) | undefined;

  const errorCollector = createErrorCollector({
    endpoint,
    enabled: errors,
    disabled: () => !!trackingDisabled(),
    context: getPayload,
    cache: () => cache,
    updateCache: token => {
      cache = token;
    },
    release,
    environment,
    beforeSend: async payload =>
      typeof beforeSend === 'function' ? beforeSend('error', payload) : payload,
  });

  if (distinctId) {
    void identify(distinctId);
  }

  if (autoTrack && !trackingDisabled()) {
    if (document.readyState === 'complete') {
      init();
    } else {
      document.addEventListener('readystatechange', init, true);
    }
  }

  return {
    track,
    identify,
    getSession: () => ({ cache, website }),
    ...errorCollector,
  } as UmamiTracker;
}
