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

  const assign = (a, b) => {
    Object.keys(b).forEach(key => {
      if (b[key] !== undefined) a[key] = b[key];
    });
    return a;
  };

  const hook = (_this, method, callback) => {
    const orig = _this[method];

    return (...args) => {
      callback.apply(null, args);

      return orig.apply(_this, args);
    };
  };

  const doNotTrack = () => {
    const { doNotTrack, navigator, external } = window;

    const msTrackProtection = 'msTrackingProtectionEnabled';
    const msTracking = () => {
      return external && msTrackProtection in external && external[msTrackProtection]();
    };

    const dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking();

    return dnt == '1' || dnt === 'yes';
  };

  const trackingDisabled = () =>
    (localStorage && localStorage.getItem('umami.disabled')) ||
    (dnt && doNotTrack()) ||
    (domain && !domains.includes(hostname));

  const delayDuration = 300;
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
  const root = hostUrl
    ? hostUrl.replace(/\/$/, '')
    : currentScript.src.split('/').slice(0, -1).join('/');
  const endpoint = `${root}/api/send`;
  const screen = `${width}x${height}`;
  const eventClass = /^umami--([a-z]+)--([\w]+[\w-]*)$/;
  const eventSelect = "[class*='umami--']";

  let listeners = {};
  let currentUrl = `${pathname}${search}`;
  let currentRef = document.referrer;
  let currentPageTitle = document.title;
  let cache;

  if (currentRef.substring(0, 4) === 'http') {
    if (currentRef.split('/')[2].split(':')[0] === hostname) {
      currentRef = '/' + currentRef.split('/').splice(3).join('/');
    }
  }

  /* Collect metrics */

  const getPayload = () => ({
    website,
    hostname,
    screen,
    language,
    url: currentUrl,
  });

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

  const trackView = (
    url = currentUrl,
    referrer = currentRef,
    websiteId = website,
    pageTitle = currentPageTitle,
  ) =>
    collect(
      'pageview',
      assign(getPayload(), {
        website: websiteId,
        url,
        referrer,
        pageTitle,
      }),
    );

  const trackEvent = (
    eventName,
    eventData,
    url = currentUrl,
    websiteId = website,
    pageTitle = currentPageTitle,
  ) =>
    collect(
      'event',
      assign(getPayload(), {
        website: websiteId,
        url,
        pageTitle,
        eventName,
        eventData,
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
                const href = get('href');
                if (href) {
                  location.href = href;
                }
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

    observeTitle();
    currentRef = currentUrl;
    const newUrl = url.toString();

    if (newUrl.substring(0, 4) === 'http') {
      currentUrl = '/' + newUrl.split('/').splice(3).join('/');
    } else {
      currentUrl = newUrl;
    }

    if (currentUrl !== currentRef) {
      setTimeout(() => trackView(), delayDuration);
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

  const observeTitle = () => {
    const monitorMutate = mutations => {
      currentPageTitle = mutations[0].target.text;
    };

    const observer = new MutationObserver(monitorMutate);
    observer.observe(document.querySelector('title'), {
      subtree: true,
      characterData: true,
      childList: true,
    });
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
