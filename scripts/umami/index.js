import 'promise-polyfill/src/polyfill';
import 'unfetch/polyfill';

const {
  screen: { width, height },
  navigator: { language },
  location: { hostname, pathname, search },
  localStorage: store,
  document,
  history,
} = window;

/* Load script */

const script = document.querySelector('script[data-website-id]');

if (script) {
  const website_id = script.getAttribute('data-website-id');

  if (website_id) {
    const sessionKey = 'umami.session';
    const hostUrl = new URL(script.src).origin;
    const screen = `${width}x${height}`;
    let currentUrl = `${pathname}${search}`;
    let currenrRef = document.referrer;
    const listeners = [];

    /* Helper methods */

    const post = (url, params) =>
      fetch(url, {
        method: 'post',
        cache: 'no-cache',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }).then(res => res.json());

    const createSession = data =>
      post(`${hostUrl}/api/session`, data).then(({ success, ...session }) => {
        if (success) {
          store.setItem(sessionKey, JSON.stringify(session));
          return success;
        }
      });

    const getSession = () => JSON.parse(store.getItem(sessionKey));

    const getSessionData = url => ({ website_id, hostname, url, screen, language });

    const pageView = (url, referrer) =>
      post(`${hostUrl}/api/collect`, {
        type: 'pageview',
        payload: { url, referrer, session: getSession() },
      }).then(({ success }) => {
        if (!success) {
          store.removeItem(sessionKey);
        }
        return success;
      });

    const trackEvent = (url, event_type, event_value) =>
      post(`${hostUrl}/api/collect`, {
        type: 'event',
        payload: { url, event_type, event_value, session: getSession() },
      });

    const execute = (url, referrer) => {
      const data = getSessionData(url);

      if (!store.getItem(sessionKey)) {
        createSession(data).then(success => success && pageView(url, referrer));
      } else {
        pageView(url, referrer).then(
          success =>
            !success && createSession(data).then(success => success && pageView(url, referrer)),
        );
      }
    };

    /* Handle push state */

    const handlePush = (state, title, url) => {
      removeEvents();
      currenrRef = currentUrl;
      currentUrl = url;
      execute(currentUrl, currenrRef);
      setTimeout(loadEvents, 300);
    };

    const hook = (type, cb) => {
      const orig = history[type];
      return (state, title, url) => {
        const args = [state, title, url];
        cb.apply(null, args);
        return orig.apply(history, args);
      };
    };

    history.pushState = hook('pushState', handlePush);
    history.replaceState = hook('replaceState', handlePush);

    /* Handle events */

    const removeEvents = () => {
      listeners.forEach(([element, type, listener]) => {
        console.log('removed', element.tagName, type);
        element.removeEventListener(type, listener, true);
      });
      listeners.length = 0;
    };

    const loadEvents = () => {
      document.querySelectorAll("[class*='umami--']").forEach(element => {
        element.className.split(' ').forEach(className => {
          if (/^umami--/.test(className)) {
            const [, type, value] = className.split('--');
            if (type && value) {
              const listener = () => trackEvent(currentUrl, type, value);
              listeners.push([element, type, listener]);
              element.addEventListener(type, listener, true);
            }
          }
        });
      });
    };

    /* Start */

    execute(currentUrl, currenrRef);
    loadEvents();
  }
}
