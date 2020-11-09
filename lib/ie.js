//Polyfill for HTMLCollection.forEach and NodeList.forEach
if ('NodeList' in window && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

if ('HTMLCollection' in window && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

//Polyfill fo URL

if (typeof window.URL !== 'function') {
  window.URL = function (url) {
    let protocol = url.split('//')[0],
      comps = url
        .split('#')[0]
        .replace(/^(https:\/\/|http:\/\/)|(\/)$/g, '')
        .split('/'),
      host = comps[0],
      search = comps[comps.length - 1].split('?')[1],
      tmp = host.split(':'),
      port = tmp[1],
      hostname = tmp[0];

    search = typeof search !== 'undefined' ? '?' + search : '';

    const params = search
      .slice(1)
      .split('&')
      .map(p => p.split('='))
      .reduce((obj, pair) => {
        const [key, value] = pair.map(decodeURIComponent);
        return { ...obj, [key]: value };
      }, {});

    return {
      hash: url.indexOf('#') > -1 ? url.substring(url.indexOf('#')) : '',
      protocol,
      host,
      hostname,
      href: url,
      pathname:
        '/' +
        comps
          .splice(1)
          .map(function (o) {
            return /\?/.test(o) ? o.split('?')[0] : o;
          })
          .join('/'),
      search,
      origin: protocol + '//' + host,
      port: typeof port !== 'undefined' ? port : '',
      searchParams: {
        get: p => (p in params ? params[p] : ''),
        getAll: () => params,
      },
    };
  };
}
/* Polyfill IE 11 end */
