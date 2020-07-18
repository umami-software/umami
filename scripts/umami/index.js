import 'promise-polyfill/src/polyfill';
import 'unfetch/polyfill';

const HOST_URL = process.env.UMAMI_URL;
const SESSION_VAR = 'umami.session';
const {
  screen: { width, height },
  navigator: { language },
  location: { hostname, pathname, search },
  localStorage: store,
  document,
} = window;

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
  post(`${HOST_URL}/api/session`, data).then(({ success, ...session }) => {
    if (success) {
      store.setItem(SESSION_VAR, JSON.stringify(session));
      return success;
    }
  });

const getSession = () => JSON.parse(store.getItem(SESSION_VAR));

const pageView = (url, referrer) =>
  post(`${HOST_URL}/api/collect`, {
    type: 'pageview',
    payload: { url, referrer, session: getSession() },
  }).then(({ success }) => {
    if (!success) {
      store.removeItem(SESSION_VAR);
    }
    return success;
  });

const script = document.querySelector('script[data-website-id]');

if (script) {
  const website_id = script.getAttribute('data-website-id');

  if (website_id) {
    const referrer = document.referrer;
    const screen = `${width}x${height}`;
    const url = `${pathname}${search}`;
    const data = { website_id, hostname, url, screen, language };

    if (!store.getItem(SESSION_VAR)) {
      createSession(data).then(success => success && pageView(url, referrer));
    } else {
      pageView(url, referrer).then(success => !success && createSession(data));
    }
  }
}
