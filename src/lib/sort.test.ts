import { describe, expect, test } from 'vitest';
import { sanitizeSortFilters } from './sort';

describe('sanitizeSortFilters', () => {
  const allowed = ['name', 'createdAt'] as const;

  test('keeps orderBy and sortDescending when the field is allowed', () => {
    const result = sanitizeSortFilters({ orderBy: 'name', sortDescending: true }, allowed);
    expect(result).toEqual({ orderBy: 'name', sortDescending: true });
  });

  test('drops orderBy when the field is not allowed', () => {
    const result = sanitizeSortFilters({ orderBy: 'secret', sortDescending: true }, allowed);
    expect(result).toEqual({});
  });

  test('falls back to defaults when the field is not allowed', () => {
    const result = sanitizeSortFilters({ orderBy: 'secret' }, allowed, {
      orderBy: 'createdAt',
      sortDescending: false,
    });
    expect(result).toEqual({ orderBy: 'createdAt', sortDescending: false });
  });

  test('applies defaults when orderBy is missing', () => {
    const result = sanitizeSortFilters({}, allowed, { orderBy: 'name' });
    expect(result).toEqual({ orderBy: 'name' });
  });

  test('preserves other filter fields', () => {
    const result = sanitizeSortFilters({ orderBy: 'bad', startDate: new Date(0) } as any, allowed);
    expect(result).toMatchObject({ startDate: new Date(0) });
    expect(result).not.toHaveProperty('orderBy');
  });
});
