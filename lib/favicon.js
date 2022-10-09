import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import { TimeoutController } from 'timeout-abort-controller';

const filterLinks = links => {
  const attrs = ['rel', 'href', 'sizes'];
  const filterAttrs = link =>
    attrs.reduce((total, attr) => ({ ...total, [attr]: link.getAttribute(attr) }), {});
  return [...links]
    .filter(link => link.getAttribute('href') && link.getAttribute('rel').includes('icon'))
    .map(filterAttrs);
};

const formatValues = (url, icons) => {
  const getOrigin = url => new URL(url).origin;
  return icons.map(({ sizes, href, rel }) => ({
    size: parseInt(sizes?.split('x')[0]) || undefined,
    href: href[0] === '/' ? `${getOrigin(url)}${href}` : href,
    rel,
  }));
};

const fetchLinks = async url => {
  // Time out the favicon request if it doesn't respond in a reasonable time.
  const tc = new TimeoutController(3000);

  let links = [];

  try {
    const html = await (await fetch(url, { signal: tc.signal })).text();
    links = parse(html).querySelectorAll('head link');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`Could not fetch favicon for url ${url}`, e);
  } finally {
    tc.clear();
  }

  return links;
};

const getIcons = async url => {
  const links = await fetchLinks(url);
  const icons = filterLinks(links);
  return formatValues(url, icons);
};

export default async domain => {
  const icons = await getIcons(`https://${domain}`);

  if (icons.length && icons.length > 0) {
    return icons[0]?.href;
  }

  return null;
};
