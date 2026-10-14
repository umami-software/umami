import { type BeforeSend, createTracker, type UmamiTracker } from '../../packages/tracker/src';

type UmamiConfig = {
  websiteId?: string;
  hostUrl?: string;
  autoTrack?: boolean;
  autoPageview?: boolean;
  doNotTrack?: boolean;
  excludeSearch?: boolean;
  excludeHash?: boolean;
  domains?: string | string[];
  tag?: string;
  distinctId?: string;
  beforeSend?: BeforeSend | string;
  errors?: boolean;
  release?: string;
  environment?: string;
  performance?: boolean;
  fetchCredentials?: RequestCredentials;
  [key: string]: unknown;
};

declare global {
  interface Window {
    umami: UmamiTracker;
    umamiConfig?: UmamiConfig;
  }
}

type TrackerDocument = Document & {
  currentScript: HTMLScriptElement | null;
};

(window => {
  const { currentScript } = window.document as TrackerDocument;
  const globalConfig = window.umamiConfig || {};
  if (!currentScript && !globalConfig.websiteId) return;

  const _data = 'data-';
  const _false = 'false';
  const _true = 'true';
  const attr = currentScript ? currentScript.getAttribute.bind(currentScript) : () => null;
  const toCamelCase = (value: string) =>
    value.replace(/-([a-z])/g, match => match[1].toUpperCase());
  const config = (value: string): string | null => {
    const fromAttr = attr(`${_data}${value}`);
    if (fromAttr != null) return fromAttr;

    const fromGlobal = (globalConfig as Record<string, unknown>)[toCamelCase(value)];
    if (fromGlobal == null || typeof fromGlobal === 'function') return null;
    return Array.isArray(fromGlobal) ? fromGlobal.join(',') : String(fromGlobal);
  };

  // Resolved on every send, so the hook may be defined after the script has loaded.
  const beforeSend: BeforeSend = (type, payload) => {
    const name = config('before-send');
    const callback = name
      ? (window as unknown as Record<string, unknown>)[name]
      : (globalConfig as Record<string, unknown>).beforeSend;
    return typeof callback === 'function' ? (callback as BeforeSend)(type, payload) : payload;
  };

  const domain = config('domains');
  const host =
    config('host-url') ||
    '__COLLECT_API_HOST__' ||
    (currentScript ? currentScript.src.split('/').slice(0, -1).join('/') : '');

  if (!currentScript && !host) return;

  const tracker = createTracker({
    websiteId: config('website-id') as string,
    endpoint: `${host.replace(/\/$/, '')}__COLLECT_API_ENDPOINT__`,
    autoTrack: config('auto-track') !== _false,
    autoPageview: config('auto-pageview') !== _false,
    doNotTrack: config('do-not-track') === _true,
    excludeSearch: config('exclude-search') === _true,
    excludeHash: config('exclude-hash') === _true,
    domains: domain ? domain.split(',').map(n => n.trim()) : [],
    tag: config('tag') || undefined,
    distinctId: config('distinct-id') || undefined,
    beforeSend,
    // Only the instance exposed as window.umami listens for global errors.
    errors: !window.umami && config('errors') === _true,
    release: config('release') || undefined,
    environment: config('environment') || undefined,
    performance: config('performance') === _true,
    fetchCredentials: (config('fetch-credentials') || undefined) as RequestCredentials | undefined,
  });

  if (!window.umami) {
    window.umami = tracker;
  }
})(window);
