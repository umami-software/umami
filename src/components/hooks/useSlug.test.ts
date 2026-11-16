import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useSlug } from './useSlug';

const mockUseConfig = vi.fn();

vi.mock('@/components/hooks/useConfig', () => ({
  useConfig: () => mockUseConfig(),
}));

beforeEach(() => {
  mockUseConfig.mockReset();
});

test('builds link urls from the single configured base as before', () => {
  mockUseConfig.mockReturnValue({
    linksUrl: 'https://example.com/q',
    linksUrls: ['https://example.com/q'],
  });

  const { result } = renderHook(() => useSlug('link'));

  expect(result.current.hostUrls).toEqual(['https://example.com/q']);
  expect(result.current.getSlugUrl('abcdefgh')).toBe('https://example.com/q/abcdefgh');
  expect(result.current.getSlugUrl('abcdefgh', null)).toBe('https://example.com/q/abcdefgh');
});

test('uses the base url saved on a link when it is configured', () => {
  mockUseConfig.mockReturnValue({
    linksUrl: 'https://example.com',
    linksUrls: ['https://example.com', 'https://go.example.org'],
  });

  const { result } = renderHook(() => useSlug('link'));

  expect(result.current.getSlugUrl('abcdefgh')).toBe('https://example.com/abcdefgh');
  expect(result.current.getSlugUrl('abcdefgh', 'https://go.example.org')).toBe(
    'https://go.example.org/abcdefgh',
  );
});

test('falls back to the default base when the saved one is no longer configured', () => {
  mockUseConfig.mockReturnValue({
    linksUrl: 'https://example.com',
    linksUrls: ['https://example.com'],
  });

  const { result } = renderHook(() => useSlug('link'));

  expect(result.current.getSlugUrl('abcdefgh', 'https://go.example.org')).toBe(
    'https://example.com/abcdefgh',
  );
});

test('keeps pixel urls on PIXELS_URL', () => {
  mockUseConfig.mockReturnValue({
    linksUrls: ['https://example.com', 'https://go.example.org'],
    pixelsUrl: 'https://example.com/p',
  });

  const { result } = renderHook(() => useSlug('pixel'));

  expect(result.current.hostUrls).toEqual(['https://example.com/p']);
  expect(result.current.getSlugUrl('abcdefgh', 'https://go.example.org')).toBe(
    'https://example.com/p/abcdefgh',
  );
});
