import { describe, expect, it } from 'vitest';
import {
  assertNoRemovedFunnelSteps,
  FUNNEL_STEPS_JSON_EXAMPLE,
  parseFunnelStepsJson,
  REMOVED_FUNNEL_STEPS_MESSAGE,
} from './funnel-steps';
import { McpToolError } from './errors';

describe('parseFunnelStepsJson', () => {
  it('parses a valid steps JSON array', () => {
    expect(parseFunnelStepsJson(FUNNEL_STEPS_JSON_EXAMPLE)).toEqual([
      { type: 'path', value: '/' },
      { type: 'event', value: 'signup' },
    ]);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseFunnelStepsJson('not-json')).toThrow(McpToolError);
  });

  it('rejects too few steps', () => {
    expect(() => parseFunnelStepsJson('[{"type":"path","value":"/"}]')).toThrow(McpToolError);
  });
});

describe('assertNoRemovedFunnelSteps', () => {
  it('throws when legacy steps array is passed', () => {
    expect(() =>
      assertNoRemovedFunnelSteps({
        steps: [{ type: 'path', value: '/' }],
      }),
    ).toThrow(REMOVED_FUNNEL_STEPS_MESSAGE);
  });
});
