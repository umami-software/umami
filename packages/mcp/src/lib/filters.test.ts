import { describe, expect, it } from 'vitest';
import {
  assertNoEventFilter,
  assertNoRemovedFilters,
  filtersFromInput,
  REMOVED_FILTERS_MESSAGE,
  toFilterParams,
} from './filters';
import { McpToolError } from './errors';

describe('filtersFromInput', () => {
  it('picks only known filter keys from flat tool input', () => {
    expect(
      filtersFromInput({
        websiteId: '00000000-0000-0000-0000-000000000001',
        browser: 'chrome',
        country: 'US',
        startAt: '2024-01-01',
      }),
    ).toEqual({ browser: 'chrome', country: 'US' });
  });

  it('omits event when allowEvent is false', () => {
    expect(filtersFromInput({ event: 'signup', browser: 'chrome' }, { allowEvent: false })).toEqual({
      browser: 'chrome',
    });
  });

  it('returns undefined when no filter fields are set', () => {
    expect(filtersFromInput({ websiteId: 'x' })).toBeUndefined();
  });
});

describe('assertNoEventFilter', () => {
  it('throws when event is present', () => {
    expect(() => assertNoEventFilter({ event: 'signup' })).toThrow(McpToolError);
  });
});

describe('assertNoRemovedFilters', () => {
  it('throws when legacy filters object is passed', () => {
    expect(() => assertNoRemovedFilters({ filters: { country: 'US' } })).toThrow(McpToolError);
    expect(() => assertNoRemovedFilters({ filters: { country: 'US' } })).toThrow(
      REMOVED_FILTERS_MESSAGE,
    );
  });

  it('filtersFromInput rejects legacy filters before picking fields', () => {
    expect(() => filtersFromInput({ filters: { browser: 'chrome' } })).toThrow(
      REMOVED_FILTERS_MESSAGE,
    );
  });
});

describe('toFilterParams', () => {
  it('maps filters to API query keys', () => {
    expect(toFilterParams({ browser: 'chrome', segment: 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2' })).toEqual({
      browser: 'chrome',
      segment: 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2',
    });
  });
});
