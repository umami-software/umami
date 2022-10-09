import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import { parse } from 'node-html-parser';

//Node.js >=14.17 only
//const AbortController = globalThis.AbortController || (await import('abort-controller'));

const filterLinks = links => {
  const attrs = ['rel', 'href', 'sizes'];
  const filterAttrs = link =>
    attrs.reduce((total, attr) => ({ ...total, [attr]: link.getAttribute(attr) }), {});
  return [...links]
    .filter(link => link.getAttribute('href') && link.getAttribute('rel').includes('icon'))
    .map(filterAttrs);
};

const updateAttrs = url => icons => {
  const getOrigin = url => new URL(url).origin;
  return icons.map(({ sizes, href, rel }) => ({
    size: parseInt(sizes?.split('x')[0]) || undefined,
    href: href[0] === '/' ? `${getOrigin(url)}${href}` : href,
    rel,
  }));
};

const fetchLinks = url => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    // eslint-disable-next-line no-console
    console.log('Aborting!');
    controller.abort();
  }, 1000);

  try {
    return fetch(url, { signal: controller.signal })
      .then(res => res.text())
      .then(str => parse(str))
      .then(html => html.querySelectorAll('head link'));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`Could not fetch favicon for url ${url}`, e);
  } finally {
    clearTimeout(timeout);
  }
};

const getIcons = url => fetchLinks(url).then(filterLinks).then(updateAttrs(url));

export default async domain => {
  const icons = await getIcons(`https://${domain}`);

  if (icons.length && icons.length > 0) {
    return icons[0]?.href;
  }

  return null;
};
