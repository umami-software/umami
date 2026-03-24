import { createTracker } from '../../packages/tracker/src';

(window => {
  const { currentScript } = window.document;
  if (!currentScript) return;

  const _data = 'data-';
  const _false = 'false';
  const _true = 'true';
  const attr = currentScript.getAttribute.bind(currentScript);
  const beforeSend = attr(`${_data}before-send`);
  const host =
    attr(`${_data}host-url`) ||
    '__COLLECT_API_HOST__' ||
    currentScript.src.split('/').slice(0, -1).join('/');

  // Create tracker instance
  const tracker = createTracker({
    website: attr(`${_data}website-id`),
    endpoint: `${host.replace(/\/$/, '')}__COLLECT_API_ENDPOINT__`,
    tag: attr(`${_data}tag`) || undefined,
    autoTrack: attr(`${_data}auto-track`) !== _false,
    domains: (attr(`${_data}domains`) || '').split(',').map(n => n.trim()),
    excludeSearch: attr(`${_data}exclude-search`) === _true,
    excludeHash: attr(`${_data}exclude-hash`) === _true,
    doNotTrack: attr(`${_data}do-not-track`) === _true,
    beforeSend: beforeSend ? window[beforeSend] : undefined,
    credentials: attr(`${_data}fetch-credentials`) || 'omit',
  });

  // Expose to window.umami
  if (!window.umami) {
    window.umami = {
      track: tracker.track,
      identify: tracker.identify,
    };
  }
})(window);
