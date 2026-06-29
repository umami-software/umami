import { describe, expect, it } from 'vitest';
import { resolveVisitorId } from './identity';

describe('resolveVisitorId', () => {
  it('uses the server fingerprint id when no client vid is provided', () => {
    expect(resolveVisitorId({ fingerprintId: 'fp-123' })).toBe('fp-123');
  });

  it('prefers an explicit client vid (opt-in) over the fingerprint', () => {
    expect(resolveVisitorId({ clientVid: 'vid-abc', fingerprintId: 'fp-123' })).toBe('vid-abc');
  });

  it('falls back to the fingerprint when client vid is an empty string', () => {
    expect(resolveVisitorId({ clientVid: '', fingerprintId: 'fp-123' })).toBe('fp-123');
  });
});
