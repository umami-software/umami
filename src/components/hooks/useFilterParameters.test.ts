import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const nav: { pathname: string; query: Record<string, any> } = {
  pathname: '/websites/1',
  query: {},
};

let shareValue: any = null;

vi.mock('./useNavigation', () => ({
  useNavigation: () => nav,
}));

vi.mock('./context/useShare', () => ({
  useShare: () => shareValue,
}));

import { useFilterParameters } from './useFilterParameters';

function setup(props?: { includePagination?: boolean }) {
  return renderHook(() => useFilterParameters(props)).result.current;
}

describe('useFilterParameters', () => {
  beforeEach(() => {
    nav.pathname = '/websites/1';
    nav.query = {};
    shareValue = null;
  });

  test('includes filter-column params and session property filters', () => {
    nav.query = { path: 'x', spf1: 'y', notAField: 'z' };
    const params = setup();

    expect(params.path).toBe('x');
    expect(params.spf1).toBe('y');
    expect(params).not.toHaveProperty('notAField');
  });

  test('includes event property filters only on the events path', () => {
    nav.pathname = '/websites/1/events';
    nav.query = { epf1: 'e' };
    const params = setup();

    expect(params.epf1).toBe('e');
  });

  test('excludes event property filters off the events path', () => {
    nav.pathname = '/websites/1';
    nav.query = { epf1: 'e' };
    const params = setup();

    expect(params).not.toHaveProperty('epf1');
  });

  test('strips trailing index when matching filter columns', () => {
    nav.query = { path12: 'x' };
    const params = setup();

    expect(params.path12).toBe('x');
  });

  test('passes through search, segment, cohort, excludeBounce and match when allowed', () => {
    nav.query = {
      search: 's',
      segment: 'seg',
      cohort: 'co',
      excludeBounce: '1',
      match: 'all',
    };
    const params = setup();

    expect(params).toMatchObject({
      search: 's',
      segment: 'seg',
      cohort: 'co',
      excludeBounce: '1',
      match: 'all',
    });
  });

  test('includes pagination by default', () => {
    nav.query = { page: '2', pageSize: '25' };
    const params = setup();

    expect(params.page).toBe('2');
    expect(params.pageSize).toBe('25');
  });

  test('omits pagination when includePagination is false', () => {
    nav.query = { page: '2', pageSize: '25' };
    const params = setup({ includePagination: false });

    expect(params).not.toHaveProperty('page');
    expect(params).not.toHaveProperty('pageSize');
  });

  test('drops filter params and share-gated params when filtering is disallowed', () => {
    shareValue = { parameters: { allowFilter: false } };
    nav.query = {
      path: 'x',
      spf1: 'y',
      search: 's',
      segment: 'seg',
      cohort: 'co',
      excludeBounce: '1',
      match: 'all',
    };
    const params = setup();

    // filter columns and property filters are excluded entirely
    expect(params).not.toHaveProperty('path');
    expect(params).not.toHaveProperty('spf1');
    // share-gated params become undefined
    expect(params.segment).toBeUndefined();
    expect(params.cohort).toBeUndefined();
    expect(params.excludeBounce).toBeUndefined();
    expect(params.match).toBeUndefined();
    // search is always passed through
    expect(params.search).toBe('s');
  });
});
