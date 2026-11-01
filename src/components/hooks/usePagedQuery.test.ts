import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseQuery = vi.fn();
const mockNavigation = {
  query: {} as Record<string, any>,
};

vi.mock('./useNavigation', () => ({
  useNavigation: () => mockNavigation,
}));

vi.mock('./useApi', () => ({
  useApi: () => ({
    useQuery: mockUseQuery,
  }),
}));

import { usePagedQuery } from './usePagedQuery';

describe('usePagedQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigation.query = {};
  });

  it('includes pageSize in queryKey and queryFn parameters when present', () => {
    mockNavigation.query = {
      page: 2,
      pageSize: 50,
      search: 'test',
      orderBy: 'name',
      sortDescending: true,
    };

    const queryFn = vi.fn();
    renderHook(() =>
      usePagedQuery({
        queryKey: ['websites'],
        queryFn,
      }),
    );

    expect(mockUseQuery).toHaveBeenCalledTimes(1);
    const callArgs = mockUseQuery.mock.calls[0][0];

    expect(callArgs.queryKey).toEqual(['websites', 2, 'test', 'name', true, 50]);

    callArgs.queryFn();
    expect(queryFn).toHaveBeenCalledWith({
      page: 2,
      search: 'test',
      orderBy: 'name',
      sortDescending: true,
      pageSize: 50,
    });
  });

  it('passes undefined pageSize when not present in query', () => {
    mockNavigation.query = {
      page: 1,
    };

    const queryFn = vi.fn();
    renderHook(() =>
      usePagedQuery({
        queryKey: ['websites'],
        queryFn,
      }),
    );

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs.queryKey).toEqual(['websites', 1, undefined, undefined, undefined, undefined]);

    callArgs.queryFn();
    expect(queryFn).toHaveBeenCalledWith({
      page: 1,
      search: undefined,
      orderBy: undefined,
      sortDescending: undefined,
      pageSize: undefined,
    });
  });
});
