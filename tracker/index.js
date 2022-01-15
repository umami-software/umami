import { doNotTrack, hook } from '../lib/web';
import { removeTrailingSlash } from '../lib/url';

(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location: { hostname, pathname, search },
    localStorage,
    sessionStorage,
    document,
    history,
  } = window;

  const script = document.querySelector('script[data-website-id]');

  if (!script) return;

  const attr = script.getAttribute.bind(script);
  const website = attr('data-website-id');
  const hostUrl = attr('data-host-url');
  const autoTrack = attr('data-auto-track') !== 'false';
  const dnt = attr('data-do-not-track');
  const useCache = attr('data-cache');
  const domain = attr('data-domains') || '';
  const domains = domain.split(',').map(n => n.trim());

  const eventClass = /^umami--([a-z]+)--([\w]+[\w-]*)$/;
  const eventSelect = "[class*='umami--']";
  const cacheKey = 'umami.cache';

  const disableTracking = () =>
    (localStorage && localStorage.getItem('umami.disabled')) ||
    (dnt && doNotTrack()) ||
    (domain && !domains.includes(hostname));

  const root = hostUrl
    ? removeTrailingSlash(hostUrl)
    : script.src.split('/').slice(0, -1).join('/');
  const screen = `${width}x${height}`;
  const listeners = {};
  let currentUrl = `${pathname}${search}`;
  let currentRef = document.referrer;

  /* Collect metrics */

  const post = (url, data, callback) => {
    const req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        callback(req.response);
      }
    };

    req.send(JSON.stringify(data));
  };

  const collect = (type, params, uuid) => {
    if (disableTracking()) return;

    const payload = {
      website: uuid,
      hostname,
      screen,
      language,
      cache: useCache && sessionStorage.getItem(cacheKey),
    };

    Object.keys(params).forEach(key => {
      payload[key] = params[key];
    });

    post(
      `${root}/api/collect`,
      {
        type,
        payload,
      },
      res => useCache && sessionStorage.setItem(cacheKey, res),
    );
  };

  const trackView = (url = currentUrl, referrer = currentRef, uuid = website) => {
    collect(
      'pageview',
      {
        url,
        referrer,
      },
      uuid,
    );
  };

  const trackEvent = (event_value, event_type = 'custom', url = currentUrl, uuid = website) => {
    collect(
      'event',
      {
        event_type,
        event_value,
        url,
      },
      uuid,
    );
  };

  /* Handle events */

  const addEvents = node => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = element => {
    element.className &&
      element.className.split(' ').forEach(className => {
        if (!eventClass.test(className)) return;

        const [, type, value] = className.split('--');
        const listener = listeners[className]
          ? listeners[className]
          : (listeners[className] = () => trackEvent(value, type));

        element.addEventListener(type, listener, true);
      });
  };

  const monitorMutate = mutations => {
    mutations.forEach(mutation => {
      const element = mutation.target;
      addEvent(element);
      addEvents(element);
    });
  };

  /* Handle history changes */

  const handlePush = (state, title, url) => {
    if (!url) return;

    currentRef = currentUrl;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      currentUrl = '/' + newUrl.split('/').splice(3).join('/');
    } else {
      currentUrl = newUrl;
    }

    if (currentUrl !== currentRef) {
      trackView();
    }
  };

  /* Global */

  if (!window.umami) {
    const umami = eventValue => trackEvent(eventValue);
    umami.trackView = trackView;
    umami.trackEvent = trackEvent;

    window.umami = umami;
  }

  /* Start */

  if (autoTrack && !disableTracking()) {
    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);

    const update = () => {
      if (document.readyState === 'complete') {
        addEvents(document);
        trackView();

        const observer = new MutationObserver(monitorMutate);
        observer.observe(document, { childList: true, subtree: true });
      }
    };
    document.addEventListener('readystatechange', update, true);
    update();
  }
})(window);
