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

function post(url, params) {
  return fetch(url, {
    method: 'post',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(res => res.json());
}

const script = document.querySelector('script[data-website-id]');

if (script) {
  const website_id = script.getAttribute('data-website-id');

  if (website_id) {
    const referrer = document.referrer;
    const screen = `${width}x${height}`;
    const url = `${pathname}${search}`;

    if (!store.getItem(SESSION_VAR)) {
      post(`${HOST_URL}/api/session`, {
        website_id,
        hostname,
        url,
        screen,
        language,
      }).then(session => {
        store.setItem(SESSION_VAR, JSON.stringify(session));
      });
    }

    post(`${HOST_URL}/api/collect`, {
      type: 'pageview',
      payload: { url, referrer, session: JSON.parse(store.getItem(SESSION_VAR)) },
    }).then(response => {
      if (!response.status) {
        store.removeItem(SESSION_VAR);
      }
    });
  }
}
