import { doNotTrack, hook } from '../lib/web';
import { removeTrailingSlash } from '../lib/url';

(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location: { hostname, pathname, search },
    document,
    history,
  } = window;

  const script = document.querySelector('script[data-website-id]');
  const attr = key => script && script.getAttribute(key);

  const website = attr('data-website-id');
  const hostUrl = attr('data-host-url');
  const autoTrack = attr('data-auto-track') !== 'false';
  const dnt = attr('data-do-not-track') === 'true';

  if (!script || (dnt && doNotTrack())) return;

  const root = hostUrl
    ? removeTrailingSlash(hostUrl)
    : new URL(script.src).href.split('/').slice(0, -1).join('/');
  const screen = `${width}x${height}`;
  const listeners = [];
  let currentUrl = `${pathname}${search}`;
  let currentRef = document.referrer;

  /* Collect metrics */

  const post = (url, data, callback) => {
    const req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        callback && callback();
      }
    };

    req.send(JSON.stringify(data));
  };

  const collect = (type, params, uuid) => {
    const payload = {
      website: uuid,
      hostname,
      screen,
      language,
    };

    if (params) {
      Object.keys(params).forEach(key => {
        payload[key] = params[key];
      });
    }

    return post(`${root}/api/collect`, {
      type,
      payload,
    });
  };

  const trackView = (url = currentUrl, referrer = currentRef, uuid = website) =>
    collect(
      'pageview',
      {
        url,
        referrer,
      },
      uuid,
    );

  const trackEvent = (event_value, event_type = 'custom', url = currentUrl, uuid = website) =>
    collect(
      'event',
      {
        event_type,
        event_value,
        url,
      },
      uuid,
    );

  /* Handle events */

  const addEvents = () => {
    document.querySelectorAll("[class*='umami--']").forEach(element => {
      element.className.split(' ').forEach(className => {
        if (/^umami--([a-z]+)--([a-z0-9_]+[a-z0-9-_]+)$/.test(className)) {
          const [, type, value] = className.split('--');
          const listener = () => trackEvent(value, type);

          listeners.push([element, type, listener]);
          element.addEventListener(type, listener, true);
        }
      });
    });
  };

  const removeEvents = () => {
    listeners.forEach(([element, type, listener]) => {
      element && element.removeEventListener(type, listener, true);
    });
    listeners.length = 0;
  };

  /* Handle history changes */

  const handlePush = (state, title, url) => {
    removeEvents();

    currentRef = currentUrl;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      const { pathname, search } = new URL(newUrl);
      currentUrl = `${pathname}${search}`;
    } else {
      currentUrl = newUrl;
    }

    trackView(currentUrl, currentRef);

    setTimeout(addEvents, 300);
  };

  /* Global */

  if (!window.umami) {
    const umami = event_value => trackEvent(event_value);
    umami.trackView = trackView;
    umami.trackEvent = trackEvent;

    window.umami = umami;
  }

  /* Start */

  if (autoTrack) {
    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);

    trackView(currentUrl, currentRef);

    addEvents();
  }
})(window);
