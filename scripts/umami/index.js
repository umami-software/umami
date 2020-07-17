import 'whatwg-fetch';

function post(url, params) {
  return fetch(url, {
    method: 'post',
    body: JSON.stringify(params),
  }).then(res => res.json());
}

(async () => {
  const script = document.querySelector('script[data-website-id]');
  const website_id = script.getAttribute('data-website-id');

  if (website_id) {
    const { width, height } = window.screen;
    const { language } = window.navigator;
    const { hostname, pathname, search } = window.location;
    const referrer = window.document.referrer;
    const screen = `${width}x${height}`;
    const url = `${pathname}${search}`;

    if (!window.localStorage.getItem('umami.session')) {
      const session = await post(`${process.env.UMAMI_URL}/api/session`, {
        website_id,
        hostname,
        url,
        screen,
        language,
      });
      console.log(session);
      window.localStorage.setItem('umami.session', JSON.stringify(session));
    }

    await post(`${process.env.UMAMI_URL}/api/collect`, {
      type: 'pageview',
      payload: { url, referrer, session: JSON.parse(window.localStorage.getItem('umami.session')) },
    });
  }
})();
