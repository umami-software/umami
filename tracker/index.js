import { doNotTrack, hook } from '../lib/web';
import { removeTrailingSlash } from '../lib/url';

(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location: { hostname, pathname, search },
    localStorage,
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
  const cssEvents = attr('data-css-events') !== 'false';
  const domain = attr('data-domains') || '';
  const domains = domain.split(',').map(n => n.trim());

  const eventClass = /^umami--([a-z]+)--([\w]+[\w-]*)$/;
  const eventSelect = "[class*='umami--']";

  const trackingDisabled = () =>
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
  let cache;

  /* Collect metrics */

  const post = (url, data, callback) => {
    const req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    if (cache) req.setRequestHeader('x-umami-cache', cache);

    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        callback(req.response);
      }
    };

    req.send(JSON.stringify(data));
  };

  const getPayload = () => ({
    website,
    hostname,
    screen,
    language,
    url: currentUrl,
  });

  const assign = (a, b) => {
    Object.keys(b).forEach(key => {
      a[key] = b[key];
    });
    return a;
  };

  const collect = (type, payload) => {
    if (trackingDisabled()) return;

    post(
      `${root}/api/collect`,
      {
        type,
        payload,
      },
      res => (cache = res),
    );
  };

  const trackView = (url = currentUrl, referrer = currentRef, uuid = website) => {
    collect(
      'pageview',
      assign(getPayload(), {
        website: uuid,
        url,
        referrer,
      }),
    );
  };

  const trackEvent = (event_value, event_type = 'custom', url = currentUrl, uuid = website) => {
    collect(
      'event',
      assign(getPayload(), {
        website: uuid,
        url,
        event_type,
        event_value,
      }),
    );
  };

  /* Handle events */

  const sendEvent = (value, type) => {
    const payload = getPayload();

    payload.event_type = type;
    payload.event_value = value;

    const data = JSON.stringify({
      type: 'event',
      payload,
    });

    navigator.sendBeacon(`${root}/api/collect`, data);
  };

  const addEvents = node => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = element => {
    (element.getAttribute('class') || '').split(' ').forEach(className => {
      if (!eventClass.test(className)) return;

      const [, type, value] = className.split('--');
      const listener = listeners[className]
        ? listeners[className]
        : (listeners[className] = () => {
            if (element.tagName === 'A') {
              sendEvent(value, type);
            } else {
              trackEvent(value, type);
            }
          });

      element.addEventListener(type, listener, true);
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

  const observeDocument = () => {
    const monitorMutate = mutations => {
      mutations.forEach(mutation => {
        const element = mutation.target;
        addEvent(element);
        addEvents(element);
      });
    };

    const observer = new MutationObserver(monitorMutate);
    observer.observe(document, { childList: true, subtree: true });
  };

  /* Global */

  if (!window.umami) {
    const umami = eventValue => trackEvent(eventValue);
    umami.trackView = trackView;
    umami.trackEvent = trackEvent;

    window.umami = umami;
  }

  /* Start */

  if (autoTrack && !trackingDisabled()) {
    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);

    const update = () => {
      if (document.readyState === 'complete') {
        trackView();

        if (cssEvents) {
          addEvents(document);
          observeDocument();
        }
      }
    };

    document.addEventListener('readystatechange', update, true);

    update();
  }
})(window);
