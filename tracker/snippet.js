(window => {
  const umami = window.umami = window.umami || [];
  if (!umami.registerAutoEvents) {
    if (umami.invoked) {
      window.console && console.error && console.error('Umami snippet included twice.');
    } else {
      umami.invoked = true;
      umami.calls = [];
      umami.methods = ['registerAutoEvents', 'event', 'pageView'];
      umami.factory = t => {
        return function() {
          const e = Array.prototype.slice.call(arguments);
          e.unshift(t);
          umami.calls.push(e);
          return umami;
        };
      };
      for (let t = 0; t < umami.methods.length; t++) {
        let e = umami.methods[t];
        umami[e] = umami.factory(e);
      }
      umami.load = function(umamiScript, umamiUUID, skipAuto) {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.defer = true;
        scriptElement.async = true;
        scriptElement.setAttribute('data-website-id', umamiUUID);
        if (skipAuto) {
          scriptElement.setAttribute('data-skip-auto', 'true');
        }
        scriptElement.src = umamiScript;
        const otherScript = document.getElementsByTagName('script')[0];
        otherScript.parentNode.insertBefore(scriptElement, otherScript);
      };

      umami.load('[HOST]/umami.js', '[UMAMI_UUID]', false);
    }
  }
})(window);
// This snippet is for more advanced use case of Umami. If you want to track custom events,
// and not worry about having blocking script in the header,
// use this snippet (compiled version available in /public/snippet.js).
// Just remember to replace [HOST] and [UMAMI_UUID] when pasting it.