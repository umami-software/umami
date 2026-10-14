import { errorPagePath, scrubErrorTags, scrubErrorText } from './error-utils';

export interface ErrorCaptureOptions {
  release?: string;
  environment?: string;
  tags?: Record<string, string>;
  fingerprint?: string[];
}

interface CollectorOptions {
  endpoint: string;
  enabled: boolean;
  disabled: () => boolean;
  context: () => {
    website: string | null;
    id?: string;
    url: string;
    screen: string;
    language: string;
  };
  cache: () => string | undefined;
  updateCache: (cache: string) => void;
  release: string;
  environment: string;
  beforeSend: (
    payload: Record<string, unknown>,
  ) => Promise<Record<string, unknown> | null | undefined>;
}

function occurrenceId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createErrorCollector(options: CollectorOptions) {
  const seen = new WeakMap<object, number>();
  const queue: Array<{ payload: Record<string, unknown>; cache?: string }> = [];
  let sending = false;
  let preparing = false;
  let stopped = false;
  let blockedUntil = 0;
  let bucket = 0;
  let count = 0;

  async function flush() {
    if (sending) return;
    sending = true;
    try {
      while (queue.length && !stopped) {
        const item = queue.shift();
        if (!item || options.disabled()) continue;
        // Freeze the payload and identity across retries.
        const body = JSON.stringify({ type: 'error', payload: item.payload });
        if (new TextEncoder().encode(body).byteLength > 48000) continue;
        for (let attempt = 0; attempt < 3; attempt++) {
          if (options.disabled()) break;
          try {
            const response = await fetch(options.endpoint, {
              method: 'POST',
              keepalive: true,
              credentials: 'omit',
              body,
              headers: {
                'Content-Type': 'application/json',
                ...(item.cache ? { 'x-umami-cache': item.cache } : {}),
              },
            });
            if (response.ok) {
              const result = (await response.json()) as { cache?: string; reason?: string };
              if (result.reason === 'errors_disabled') stopped = true;
              if (
                result.cache &&
                options.cache() === item.cache &&
                options.context().id === item.payload.id
              ) {
                options.updateCache(result.cache);
              }
              break;
            }
            if (response.status === 429) {
              queue.length = 0;
              const seconds = Number(response.headers.get('Retry-After')) || 60;
              blockedUntil = Date.now() + Math.max(1, Math.min(seconds, 300)) * 1000;
              // Avoid holding a page alive or retrying an error storm.
              break;
            }
            if (response.status < 500) break;
          } catch {
            /* Collection failures must never become application errors. */
          }
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
        }
      }
    } finally {
      sending = false;
      if (stopped) queue.length = 0;
    }
  }

  async function capture(
    error: unknown,
    config: ErrorCaptureOptions = {},
    handled = true,
  ): Promise<void> {
    try {
      if (!options.enabled || stopped || preparing || options.disabled() || queue.length >= 20)
        return;
      const now = Date.now();
      if (now < blockedUntil) return;
      const minute = Math.floor(now / 60000);
      if (bucket !== minute) {
        bucket = minute;
        count = 0;
      }
      if (count >= 20) return;
      if (error && typeof error === 'object') {
        if (now - (seen.get(error) || 0) < 1000) return;
        seen.set(error, now);
      }
      count++;
      const context = options.context();
      const initialCache = options.cache();
      const value =
        error && typeof error === 'object'
          ? (error as { name?: unknown; message?: unknown; stack?: unknown })
          : null;
      // Don't JSON-serialize arbitrary rejection objects (they can contain credentials).
      const message =
        typeof value?.message === 'string'
          ? value.message
          : typeof error === 'string'
            ? error
            : 'Non-Error exception';
      const payload = {
        version: 1,
        website: context.website,
        eventId: occurrenceId(),
        timestamp: now,
        name:
          scrubErrorText(typeof value?.name === 'string' ? value.name : 'Error', 200) || 'Error',
        message: scrubErrorText(message),
        stack: scrubErrorText(typeof value?.stack === 'string' ? value.stack : '', 16000),
        handled,
        url: errorPagePath(context.url),
        id: context.id,
        screen: context.screen,
        language: context.language,
        release: scrubErrorText(config.release || options.release, 100),
        environment: scrubErrorText(config.environment || options.environment, 50),
        tags: scrubErrorTags(config.tags),
        ...(config.fingerprint?.length
          ? { fingerprint: config.fingerprint.slice(0, 5).map(v => scrubErrorText(v, 200)) }
          : {}),
      };
      preparing = true;
      let pending: ReturnType<CollectorOptions['beforeSend']>;
      try {
        pending = options.beforeSend(payload);
      } finally {
        preparing = false;
      }
      const filtered = await pending;
      if (!filtered || options.disabled()) return;
      queue.push({
        payload: {
          ...filtered,
          website: payload.website,
          eventId: payload.eventId,
          timestamp: now,
          version: 1,
        },
        cache: initialCache,
      });
      void flush().catch(() => {
        /* Never reject into the host application. */
      });
    } catch {
      /* Getters, hooks, or disabled storage may throw. */
    }
  }

  if (options.enabled) {
    window.addEventListener('error', event => {
      if (!event.message) return; // Resource load failures aren't JavaScript exceptions.
      void capture(
        event.error || {
          name: 'Error',
          message: event.message,
          stack: event.filename ? `at ${event.filename}:${event.lineno}:${event.colno}` : '',
        },
        {},
        false,
      );
    });
    window.addEventListener('unhandledrejection', event => {
      void capture(event.reason, {}, false);
    });
  }
  return {
    captureException: (error: unknown, config?: ErrorCaptureOptions) => capture(error, config),
  };
}
