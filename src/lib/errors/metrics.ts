import debug from 'debug';

const log = debug('umami:errors');
const counts = {
  accepted: 0,
  disabled: 0,
  blocked: 0,
  invalid: 0,
  oversized: 0,
  throttled: 0,
  failed: 0,
};
export type ErrorIngestionOutcome = keyof typeof counts;

// Per-process counters. Never log error payloads, IPs, or stack traces.
export function recordErrorIngestion(outcome: ErrorIngestionOutcome) {
  counts[outcome]++;
  log('%o', { outcome, counts: { ...counts } });
}
