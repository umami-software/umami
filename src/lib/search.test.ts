import { describe, expect, test } from 'vitest';
import { escapeLikeValue, getWildcardMatch } from './search';

describe('escapeLikeValue', () => {
  // Search input must match literally; unescaped % / _ would match everything / any char.
  test('escapes LIKE metacharacters and backslash', () => {
    expect(escapeLikeValue('100%')).toBe('100\\%');
    expect(escapeLikeValue('my_page')).toBe('my\\_page');
    expect(escapeLikeValue('a\\b')).toBe('a\\\\b');
    expect(escapeLikeValue('%_\\')).toBe('\\%\\_\\\\');
  });

  test('leaves other characters untouched', () => {
    expect(escapeLikeValue('/blog/post?x=1')).toBe('/blog/post?x=1');
    expect(escapeLikeValue('*')).toBe('*');
  });
});

describe('getWildcardMatch', () => {
  // Goals and funnels without * are exact matches; that must not change.
  test('values without * use exact match, unescaped', () => {
    expect(getWildcardMatch('/checkout')).toEqual({ operator: '=', value: '/checkout' });
    expect(getWildcardMatch('my_event%')).toEqual({ operator: '=', value: 'my_event%' });
  });

  // Leading/trailing * produced these patterns before; existing goals must keep their numbers.
  test('leading and trailing * keep their previous patterns', () => {
    expect(getWildcardMatch('/blog/*')).toEqual({ operator: 'like', value: '/blog/%' });
    expect(getWildcardMatch('*/thanks')).toEqual({ operator: 'like', value: '%/thanks' });
    expect(getWildcardMatch('*signup*')).toEqual({ operator: 'like', value: '%signup%' });
    expect(getWildcardMatch('*')).toEqual({ operator: 'like', value: '%' });
  });

  test('inner * becomes a wildcard', () => {
    expect(getWildcardMatch('/blog/*/edit')).toEqual({ operator: 'like', value: '/blog/%/edit' });
    expect(getWildcardMatch('/a/*/b/*')).toEqual({ operator: 'like', value: '/a/%/b/%' });
  });

  test('% and _ in a wildcard pattern match literally', () => {
    expect(getWildcardMatch('/my_page/*')).toEqual({ operator: 'like', value: '/my\\_page/%' });
    expect(getWildcardMatch('*100%')).toEqual({ operator: 'like', value: '%100\\%' });
  });
});
