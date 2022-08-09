import { doNotTrack, hook } from '../lib/web';
import { removeTrailingSlash } from '../lib/url';

(window => {
  const {
    screen: { width, height },
    navigator: { language },
    location,
    localStorage,
    document,
    history,
  } = window;
  const { hostname, pathname, search } = location;
  const { currentScript } = document;

  if (!currentScript) return;

  const _data = 'data-';
  const _false = 'false';
  const attr = currentScript.getAttribute.bind(currentScript);
  const website = attr(_data + 'website-id');
  const hostUrl = attr(_data + 'host-url');
  const autoTrack = attr(_data + 'auto-track') !== _false;
  const dnt = attr(_data + 'do-not-track');
  const cssEvents = attr(_data + 'css-events') !== _false;
  const domain = attr(_data + 'domains') || '';
  const domains = domain.split(',').map(n => n.trim());

  const eventClass = /^umami--([a-z]+)--([\w]+[\w-]*)$/;
  const eventSelect = "[class*='umami--']";

  const trackingDisabled = () =>
    (localStorage && localStorage.getItem('umami.disabled')) ||
    (dnt && doNotTrack()) ||
    (domain && !domains.includes(hostname));

  const root = hostUrl
    ? removeTrailingSlash(hostUrl)
    : currentScript.src.split('/').slice(0, -1).join('/');
  const endpoint = `${root}/api/collect`;
  const screen = `${width}x${height}`;
  const listeners = {};
  let currentUrl = `${pathname}${search}`;
  let currentRef = document.referrer;
  let cache;

  /* Collect metrics */

  const getPayload = () => ({
    website,
    hostname,
    screen,
    language,
    url: currentUrl,
  });

  const assign = (a, b) => {
    Object.keys(b).forEach(key => {
      if (b[key] !== undefined) a[key] = b[key];
    });
    return a;
  };

  const collect = (type, payload) => {
    if (trackingDisabled()) return;

    return fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
      headers: assign({ 'Content-Type': 'application/json' }, { ['x-umami-cache']: cache }),
    })
      .then(res => res.text())
      .then(text => (cache = text));
  };

  const trackView = (url = currentUrl, referrer = currentRef, uuid = website) =>
    collect(
      'pageview',
      assign(getPayload(), {
        website: uuid,
        url,
        referrer,
      }),
    );

  const trackEvent = (event_name, event_data, url = currentUrl, uuid = website) =>
    collect(
      'event',
      assign(getPayload(), {
        website: uuid,
        url,
        event_name,
        event_data,
      }),
    );

  /* Handle events */

  const addEvents = node => {
    const elements = node.querySelectorAll(eventSelect);
    Array.prototype.forEach.call(elements, addEvent);
  };

  const addEvent = element => {
    const get = element.getAttribute.bind(element);
    (get('class') || '').split(' ').forEach(className => {
      if (!eventClass.test(className)) return;

      const [, event, name] = className.split('--');

      const listener = listeners[className]
        ? listeners[className]
        : (listeners[className] = e => {
            if (
              event === 'click' &&
              element.tagName === 'A' &&
              !(
                e.ctrlKey ||
                e.shiftKey ||
                e.metaKey ||
                (e.button && e.button === 1) ||
                get('target')
              )
            ) {
              e.preventDefault();
              trackEvent(name).then(() => {
                location.href = get('href');
              });
            } else {
              trackEvent(name);
            }
          });

      element.addEventListener(event, listener, true);
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
