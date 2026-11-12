import { createHash } from 'node:crypto';
import { v5 } from 'uuid';
import { errorPagePath, scrubErrorTags, scrubErrorText } from '@/tracker/error-utils';
import type { ErrorFrame, ErrorPayload } from './schema';

export function normalizeError(payload: ErrorPayload) {
  const stack = scrubErrorText(payload.stack, 16000);
  const frames: ErrorFrame[] = [];
  for (const line of stack.split('\n').slice(0, 51)) {
    // V8: at fn (url:line:col); Firefox/Safari: fn@url:line:col.
    const match = line
      .trim()
      .match(
        /^(?:at\s+)?(?:(.*?)\s*[@(])?((?:https?:\/\/|\/|webpack:|file:)[^\s]*?):(\d+):(\d+)\)?$/,
      );
    if (match && Number.isSafeInteger(+match[3]) && Number.isSafeInteger(+match[4])) {
      frames.push({
        filename: match[2],
        function: (match[1] || '').trim(),
        line: +match[3],
        column: +match[4],
      });
      if (frames.length === 50) break;
    }
  }
  const name = scrubErrorText(payload.name, 200);
  const message = scrubErrorText(payload.message);
  const components = payload.fingerprint
    ? ['custom', ...payload.fingerprint.map(value => scrubErrorText(value, 200))]
    : frames.length
      ? [
          name,
          ...frames
            .slice(0, 10)
            .map(frame => [
              frame.filename.replace(/[.-][a-f\d]{8,}(?=\.)/gi, ''),
              frame.function,
              frame.line,
              frame.column,
            ]),
        ]
      : [
          name,
          message.replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, '<id>').replace(/\b\d+\b/g, '<n>'),
        ];
  const fingerprint = createHash('sha256')
    .update(JSON.stringify([1, components]))
    .digest('hex');
  return {
    issueId: v5(`${payload.website}:1:${fingerprint}`, v5.URL),
    fingerprint,
    name,
    message,
    stack,
    frames,
    tags: scrubErrorTags(payload.tags),
    urlPath: errorPagePath(payload.url),
    release: scrubErrorText(payload.release, 100),
    environment: scrubErrorText(payload.environment, 50),
  };
}
