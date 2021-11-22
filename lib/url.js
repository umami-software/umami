export function removeTrailingSlash(url) {
  return url && url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
}

export function removeWWW(url) {
  return url && url.length > 1 && url.startsWith('www.') ? url.slice(4) : url;
}

export function getDomainName(str) {
  try {
    return new URL(str).hostname;
  } catch (e) {
    return str;
  }
}

export function getQueryString(params = {}) {
  const map = Object.keys(params).reduce((arr, key) => {
    if (params[key] !== undefined) {
      return arr.concat(`${key}=${encodeURIComponent(params[key])}`);
    }
    return arr;
  }, []);

  if (map.length) {
    return `?${map.join('&')}`;
  }

  return '';
}

export function makeUrl(url, params) {
  return `${url}${getQueryString(params)}`;
}

export function safeDecodeURI(s) {
  try {
    return decodeURI(s);
  } catch (e) {
    console.error(e);
  }
  return s;
}
