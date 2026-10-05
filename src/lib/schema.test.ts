import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import {
  attributionReportSchema,
  filterParams,
  funnelReportSchema,
  goalReportSchema,
  pagingParams,
  reportBaseSchema,
  reportTypeSchema,
  segmentTypeParam,
  sortingParams,
  teamRoleParam,
  timezoneParam,
  unitParam,
  urlOrPathParam,
  userRoleParam,
  withDateRange,
} from './schema';

const UUID = '11111111-1111-4111-8111-111111111111';

describe('timezoneParam', () => {
  test('accepts a valid timezone', () => {
    expect(timezoneParam.parse('America/New_York')).toBe('America/New_York');
  });

  test('rejects an invalid timezone', () => {
    expect(() => timezoneParam.parse('Not/AZone')).toThrow();
  });
});

describe('unitParam', () => {
  test.each(['year', 'month', 'hour', 'day', 'minute'])('accepts the %s unit', unit => {
    expect(unitParam.parse(unit)).toBe(unit);
  });

  test('rejects an unknown unit', () => {
    expect(() => unitParam.parse('week')).toThrow();
  });
});

describe('withDateRange', () => {
  const schema = withDateRange();

  test('accepts a numeric startAt/endAt range and coerces strings', () => {
    const result = schema.parse({ startAt: '5', endAt: '10' });
    expect(result.startAt).toBe(5);
    expect(result.endAt).toBe(10);
  });

  test('accepts a startDate/endDate range and coerces to dates', () => {
    const result = schema.parse({ startDate: '2024-01-01', endDate: '2024-01-31' });
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  test('rejects when neither range is fully provided', () => {
    expect(() => schema.parse({})).toThrow();
    expect(() => schema.parse({ startAt: 5 })).toThrow();
  });

  test('merges an additional shape into the schema', () => {
    const extended = withDateRange({ websiteId: z.uuid() });
    const result = extended.parse({ startAt: 1, endAt: 2, websiteId: UUID });
    expect(result.websiteId).toBe(UUID);
  });
});

describe('filterParams', () => {
  const schema = z.object({ ...filterParams });

  test('coerces eventType to a positive integer', () => {
    expect(schema.parse({ eventType: '3' }).eventType).toBe(3);
  });

  test('rejects a non-positive eventType', () => {
    expect(() => schema.parse({ eventType: '0' })).toThrow();
  });

  test('validates segment as a uuid', () => {
    expect(schema.parse({ segment: UUID }).segment).toBe(UUID);
    expect(() => schema.parse({ segment: 'not-a-uuid' })).toThrow();
  });

  test('restricts match to all or any', () => {
    expect(schema.parse({ match: 'all' }).match).toBe('all');
    expect(() => schema.parse({ match: 'some' })).toThrow();
  });

  test('allows an empty object since all fields are optional', () => {
    expect(schema.parse({})).toEqual({});
  });
});

describe('pagingParams', () => {
  const schema = z.object({ ...pagingParams });

  test('coerces page and pageSize to numbers', () => {
    const result = schema.parse({ page: '2', pageSize: '25' });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(25);
  });

  test('rejects a non-positive page', () => {
    expect(() => schema.parse({ page: '0' })).toThrow();
  });
});

describe('sortingParams', () => {
  const schema = z.object({ ...sortingParams });

  test('transforms sortDescending "true" to boolean true', () => {
    expect(schema.parse({ sortDescending: 'true' }).sortDescending).toBe(true);
  });

  test('transforms sortDescending "false" to boolean false', () => {
    expect(schema.parse({ sortDescending: 'false' }).sortDescending).toBe(false);
  });

  test('leaves sortDescending undefined when omitted', () => {
    expect(schema.parse({}).sortDescending).toBeUndefined();
  });

  test('rejects an invalid sortDescending value', () => {
    expect(() => schema.parse({ sortDescending: 'yes' })).toThrow();
  });
});

describe('userRoleParam', () => {
  test('accepts known user roles', () => {
    expect(userRoleParam.parse('admin')).toBe('admin');
    expect(userRoleParam.parse('view-only')).toBe('view-only');
  });

  test('rejects an unknown role', () => {
    expect(() => userRoleParam.parse('superuser')).toThrow();
  });
});

describe('teamRoleParam', () => {
  test('accepts a known team role', () => {
    expect(teamRoleParam.parse('team-manager')).toBe('team-manager');
  });

  test('rejects an unknown team role', () => {
    expect(() => teamRoleParam.parse('team-owner')).toThrow();
  });
});

describe('segmentTypeParam', () => {
  test('accepts segment and cohort', () => {
    expect(segmentTypeParam.parse('segment')).toBe('segment');
    expect(segmentTypeParam.parse('cohort')).toBe('cohort');
  });

  test('rejects an unknown segment type', () => {
    expect(() => segmentTypeParam.parse('group')).toThrow();
  });
});

describe('urlOrPathParam', () => {
  test('accepts a relative path', () => {
    expect(urlOrPathParam.parse('/settings/websites')).toBe('/settings/websites');
  });

  test('accepts an absolute url', () => {
    expect(urlOrPathParam.parse('https://umami.is/docs')).toBe('https://umami.is/docs');
  });
});

describe('goalReportSchema', () => {
  test('parses a valid goal report and coerces dates', () => {
    const result = goalReportSchema.parse({
      type: 'goal',
      parameters: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'event',
        value: 'signup',
      },
    });
    expect(result.parameters.startDate).toBeInstanceOf(Date);
    expect(result.parameters.value).toBe('signup');
  });

  test('rejects a mismatched literal type', () => {
    expect(() =>
      goalReportSchema.parse({
        type: 'funnel',
        parameters: { startDate: '2024-01-01', endDate: '2024-01-31', type: 'event', value: 'x' },
      }),
    ).toThrow();
  });
});

describe('funnelReportSchema', () => {
  const valid = {
    type: 'funnel' as const,
    parameters: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      window: '30',
      steps: [
        { type: 'path', value: '/home' },
        { type: 'event', value: 'purchase' },
      ],
    },
  };

  test('parses a valid funnel report and coerces window', () => {
    const result = funnelReportSchema.parse(valid);
    expect(result.parameters.window).toBe(30);
    expect(result.parameters.steps).toHaveLength(2);
  });

  test('requires at least two steps', () => {
    expect(() =>
      funnelReportSchema.parse({
        ...valid,
        parameters: { ...valid.parameters, steps: [{ type: 'path', value: '/home' }] },
      }),
    ).toThrow();
  });
});

describe('reportTypeSchema', () => {
  test('discriminates on the type field', () => {
    const result = reportTypeSchema.parse({
      type: 'attribution',
      parameters: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        model: 'first-click',
        type: 'event',
        step: 'purchase',
      },
    });
    expect(result.type).toBe('attribution');
  });

  test('rejects an unknown report type', () => {
    expect(() => reportTypeSchema.parse({ type: 'nonsense', parameters: {} })).toThrow();
  });
});

describe('attributionReportSchema', () => {
  test('rejects an invalid attribution model', () => {
    expect(() =>
      attributionReportSchema.parse({
        type: 'attribution',
        parameters: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          model: 'middle-click',
          type: 'event',
          step: 'purchase',
        },
      }),
    ).toThrow();
  });
});

describe('reportBaseSchema', () => {
  test('parses a valid report with a uuid website', () => {
    const result = reportBaseSchema.parse({
      websiteId: UUID,
      type: 'goal',
      name: 'My Report',
      parameters: { foo: 'bar' },
    });
    expect(result.name).toBe('My Report');
  });

  test('rejects a name longer than 200 characters', () => {
    expect(() =>
      reportBaseSchema.parse({
        websiteId: UUID,
        type: 'goal',
        name: 'x'.repeat(201),
        parameters: {},
      }),
    ).toThrow();
  });

  test('rejects a non-uuid website id', () => {
    expect(() =>
      reportBaseSchema.parse({ websiteId: 'nope', type: 'goal', name: 'r', parameters: {} }),
    ).toThrow();
  });
});
