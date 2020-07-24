export const post = (url, params) =>
  fetch(url, {
    method: 'post',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(res => (res.status === 200 ? res.json() : null));
