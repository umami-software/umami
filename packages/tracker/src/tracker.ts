import type {
  CustomEventFunction,
  EventData,
  PageViewProperties,
  TrackerConfig,
  UmamiTracker,
} from './types';

/**
 * Creates a new Umami tracker instance
 *
 * @param config - Configuration options for the tracker
 * @returns A tracker instance with track() and identify() methods
 */
export function createTracker(config: TrackerConfig): UmamiTracker {
  const {
    website,
    endpoint = '',
    tag,
    autoTrack = true,
    domains = [],
    excludeSearch = false,
    excludeHash = false,
    doNotTrack = false,
    beforeSend,
    credentials = 'omit',
  } = config;

  // Get browser/window globals
  const {
    screen: { width, height },
    navigator,
    location,
    document,
    history,
    top,
    localStorage: windowLocalStorage,
  } = window;

  const { language } = navigator;
  const ndnt = (navigator as any).doNotTrack;
  const msdnt = (navigator as any).msDoNotTrack;
  const windowDnt = (window as any).doNotTrack;
  const { hostname, href, origin } = location;
  const { referrer } = document;
  const localStorage = href.startsWith('data:') ? undefined : windowLocalStorage;
  const screen = `${width}x${height}`;

  // State
  let initialized = false;
  let disabled = false;
  let cache: string | undefined;
  let identity: string | undefined;
  let currentUrl = '';
  let currentRef = '';

  // Constants
  const eventRegex = /data-umami-event-([\w-_]+)/;
  const eventNameAttribute = 'data-umami-event';
  const delayDuration = 300;

  /* Helper functions */

  const normalize = (raw: string): string => {
    if (!raw) return raw;
    try {
      const u = new URL(raw, location.href);
      if (excludeSearch) u.search = '';
      if (excludeHash) u.hash = '';
      return u.toString();
    } catch {
      return raw;
    }
  };

  const getPayload = (): PageViewProperties => ({
    website,
    screen,
    language,
    title: document.title,
    hostname,
    url: currentUrl,
    referrer: currentRef,
    tag,
    id: identity ? identity : undefined,
  });

  const hasDoNotTrack = (): boolean => {
    const dnt = windowDnt || ndnt || msdnt;
    return dnt === 1 || dnt === '1' || dnt === 'yes';
  };

  const trackingDisabled = (): boolean =>
    disabled ||
    !website ||
    !!localStorage?.getItem('umami.disabled') ||
    (domains.length > 0 && !domains.includes(hostname)) ||
    (doNotTrack && hasDoNotTrack());

  /* Event handlers */

  const handlePush = (_state: any, _title: string, url?: string) => {
    if (!url) return;

    currentRef = currentUrl;
    currentUrl = normalize(new URL(url, location.href).toString());

    if (currentUrl !== currentRef) {
      setTimeout(track, delayDuration);
    }
  };

  const handlePathChanges = () => {
    const hook = (_this: any, method: string, callback: (...args: any[]) => void) => {
      const orig = _this[method];
      return (...args: any[]) => {
        callback.apply(null, args);
        return orig.apply(_this, args);
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
          if (match) eventData[match[1]] = el.getAttribute(name)!;
        });

        return track(eventName, eventData);
      }
    };

    const onClick = async (e: MouseEvent) => {
      const el = e.target as Element;
      const parentElement = el.closest('a,button');
      if (!parentElement) return trackElement(el);

      const { href, target } = parentElement as HTMLAnchorElement;
      if (!parentElement.getAttribute(eventNameAttribute)) return;

      if (parentElement.tagName === 'BUTTON') {
        return trackElement(parentElement);
      }

      if (parentElement.tagName === 'A' && href) {
        const external =
          target === '_blank' ||
          e.ctrlKey ||
          e.shiftKey ||
          e.metaKey ||
          (e.button && e.button === 1);
        if (!external) e.preventDefault();
        return trackElement(parentElement).then(() => {
          if (!external) {
            (target === '_top' ? top?.location || location : location).href = href;
          }
        });
      }
    };

    document.addEventListener('click', onClick, true);
  };

  /* Tracking functions */

  const send = async (payload: any, type: string = 'event'): Promise<void> => {
    if (trackingDisabled()) return;

    if (typeof beforeSend === 'function') {
      payload = await Promise.resolve(beforeSend(type, payload));
    }

    if (!payload) return;

    try {
      const res = await fetch(endpoint, {
        keepalive: true,
        method: 'POST',
        body: JSON.stringify({ type, payload }),
        headers: {
          'Content-Type': 'application/json',
          ...(typeof cache !== 'undefined' && { 'x-umami-cache': cache }),
        },
        credentials,
      });

      const data = await res.json();
      if (data) {
        disabled = !!data.disabled;
        cache = data.cache;
      }
    } catch (_e) {
      /* no-op */
    }
  };

  const init = () => {
    if (!initialized) {
      initialized = true;
      track();
      handlePathChanges();
      handleClicks();
    }
  };

  const track: UmamiTracker['track'] = (name?: any, data?: any): Promise<void> => {
    if (typeof name === 'string') return send({ ...getPayload(), name, data });
    if (typeof name === 'object') return send({ ...name });
    if (typeof name === 'function') return send(name(getPayload()));
    return send(getPayload());
  };

  const identify = (id: string | EventData, data?: EventData): Promise<void> => {
    if (typeof id === 'string') {
      identity = id;
    }

    cache = '';
    return send(
      {
        ...getPayload(),
        data: typeof id === 'object' ? id : data,
      },
      'identify',
    );
  };

  // Initialize current URL and referrer
  currentUrl = normalize(href);
  currentRef = normalize(referrer.startsWith(origin) ? '' : referrer);

  // Auto-initialize if enabled
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
    init,
  };
}
