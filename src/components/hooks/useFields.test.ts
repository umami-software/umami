import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// labels resolves any key to its own name; t is identity.
const labels = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string) => prop,
});

vi.mock('./useMessages', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels,
  }),
}));

import { useFields } from './useFields';

function setup() {
  return renderHook(() => useFields()).result.current;
}

describe('useFields', () => {
  test('exposes a field for every filterable column', () => {
    const { fields } = setup();
    const names = fields.map(f => f.name);

    expect(names).toEqual([
      'path',
      'query',
      'title',
      'referrer',
      'country',
      'region',
      'city',
      'browser',
      'os',
      'device',
      'utmSource',
      'utmMedium',
      'utmCampaign',
      'utmContent',
      'utmTerm',
      'hostname',
      'distinctId',
      'tag',
      'event',
    ]);
  });

  test('assigns each field to the expected group', () => {
    const { fields } = setup();
    const byName = Object.fromEntries(fields.map(f => [f.name, f.group]));

    expect(byName.path).toBe('url');
    expect(byName.referrer).toBe('sources');
    expect(byName.city).toBe('location');
    expect(byName.browser).toBe('environment');
    expect(byName.utmSource).toBe('utm');
    expect(byName.tag).toBe('other');
  });

  test('uses distinct filterLabel and label where the source distinguishes them', () => {
    const { fields } = setup();
    const utmSource = fields.find(f => f.name === 'utmSource');

    // filterLabel uses the generic "source" label, label uses "utmSource".
    expect(utmSource?.filterLabel).toBe('source');
    expect(utmSource?.label).toBe('utmSource');
  });

  test('returns group labels in display order', () => {
    const { groupLabels } = setup();

    expect(groupLabels.map(g => g.key)).toEqual([
      'url',
      'sources',
      'location',
      'environment',
      'utm',
      'other',
    ]);
  });
});
