/**
 * ISC License
 * Copyright 2022 github.com/sudoaugustin/favecon
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
 * AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
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
