import { describe, expect, test } from 'vitest';
import { hasWildcard, wildcardToLikePattern } from './wildcard';

describe('hasWildcard', () => {
  test('detects a leading or trailing *', () => {
    expect(hasWildcard('/blog/*')).toBe(true);
    expect(hasWildcard('*/thanks')).toBe(true);
    expect(hasWildcard('*/blog/*')).toBe(true);
  });

  test('ignores a * in the middle of the value', () => {
    expect(hasWildcard('/blog/*/comments')).toBe(false);
  });

  test('is false for plain values', () => {
    expect(hasWildcard('/blog')).toBe(false);
    expect(hasWildcard('')).toBe(false);
  });

  test('does not treat ? or SQL LIKE metacharacters as wildcards', () => {
    expect(hasWildcard('/post/?')).toBe(false);
    expect(hasWildcard('100%')).toBe(false);
    expect(hasWildcard('a_b')).toBe(false);
  });

  test('is true for a value that is only a wildcard', () => {
    expect(hasWildcard('*')).toBe(true);
  });
});

describe('wildcardToLikePattern', () => {
  test('translates a leading or trailing * to %', () => {
    expect(wildcardToLikePattern('/blog/*')).toBe('/blog/%');
    expect(wildcardToLikePattern('*/thanks')).toBe('%/thanks');
    expect(wildcardToLikePattern('*/blog/*')).toBe('%/blog/%');
  });

  test('escapes a * in the middle so it matches literally', () => {
    expect(wildcardToLikePattern('/blog/*/comments')).toBe('/blog/*/comments');
    expect(wildcardToLikePattern('/blog/*/*')).toBe('/blog/*/%');
  });

  test('leaves ? as a literal character', () => {
    expect(wildcardToLikePattern('/post/?')).toBe('/post/?');
  });

  test('escapes LIKE metacharacters so they match literally', () => {
    expect(wildcardToLikePattern('100%')).toBe('100\\%');
    expect(wildcardToLikePattern('a_b')).toBe('a\\_b');
    expect(wildcardToLikePattern('c:\\tmp')).toBe('c:\\\\tmp');
  });

  test('escapes metacharacters next to an edge wildcard', () => {
    expect(wildcardToLikePattern('50%*')).toBe('50\\%%');
    expect(wildcardToLikePattern('*a_b')).toBe('%a\\_b');
  });

  test('passes plain values through unchanged', () => {
    expect(wildcardToLikePattern('/blog')).toBe('/blog');
    expect(wildcardToLikePattern('')).toBe('');
  });

  test('translates a value that is only wildcards', () => {
    expect(wildcardToLikePattern('*')).toBe('%');
    expect(wildcardToLikePattern('**')).toBe('%%');
    expect(wildcardToLikePattern('***')).toBe('%*%');
  });
});
