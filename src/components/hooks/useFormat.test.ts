import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const countryNames: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
};
const languageNames: Record<string, string> = {
  en: 'English',
};
const labels: Record<string, string> = {
  unknown: 'Unknown',
  mobile: 'Mobile',
  desktop: 'Desktop',
};

vi.mock('./useMessages', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels,
  }),
}));

vi.mock('./useLocale', () => ({
  useLocale: () => ({ locale: 'en-US' }),
}));

vi.mock('./useCountryNames', () => ({
  useCountryNames: () => ({ countryNames }),
}));

vi.mock('./useLanguageNames', () => ({
  useLanguageNames: () => ({ languageNames }),
}));

import { useFormat } from './useFormat';

function setup() {
  return renderHook(() => useFormat()).result.current;
}

describe('useFormat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatOS', () => {
    test('maps known OS names', () => {
      const { formatOS } = setup();
      expect(formatOS('Mac OS')).toBe('macOS');
      expect(formatOS('Windows 10')).toBe('Windows 10/11');
    });

    test('returns the original value when unknown', () => {
      const { formatOS } = setup();
      expect(formatOS('Haiku')).toBe('Haiku');
    });
  });

  describe('formatBrowser', () => {
    test('maps known browser keys', () => {
      const { formatBrowser } = setup();
      expect(formatBrowser('chrome')).toBe('Chrome');
      expect(formatBrowser('edge-chromium')).toBe('Edge (Chromium)');
    });

    test('returns the original value when unknown', () => {
      const { formatBrowser } = setup();
      expect(formatBrowser('mystery')).toBe('mystery');
    });
  });

  describe('formatDevice', () => {
    test('translates a known device label', () => {
      const { formatDevice } = setup();
      expect(formatDevice('mobile')).toBe('Mobile');
    });

    test('falls back to the unknown label for missing devices', () => {
      const { formatDevice } = setup();
      expect(formatDevice('foo')).toBe('Unknown');
    });
  });

  describe('formatCountry', () => {
    test('maps a known country code', () => {
      const { formatCountry } = setup();
      expect(formatCountry('US')).toBe('United States');
    });

    test('returns the original value when unknown', () => {
      const { formatCountry } = setup();
      expect(formatCountry('ZZ')).toBe('ZZ');
    });
  });

  describe('formatRegion', () => {
    test('formats a known region as "Region, Country"', () => {
      const { formatRegion } = setup();
      expect(formatRegion('US-CA')).toBe('California, United States');
    });

    test('returns the original value for an unknown region', () => {
      const { formatRegion } = setup();
      expect(formatRegion('ZZ-99')).toBe('ZZ-99');
    });

    test('handles undefined without throwing', () => {
      const { formatRegion } = setup();
      expect(formatRegion(undefined)).toBeUndefined();
    });
  });

  describe('formatCity', () => {
    test('appends the country name when known', () => {
      const { formatCity } = setup();
      expect(formatCity('Portland', 'US')).toBe('Portland, United States');
    });

    test('returns just the city when the country is unknown', () => {
      const { formatCity } = setup();
      expect(formatCity('Portland', 'ZZ')).toBe('Portland');
    });

    test('returns just the city when no country is provided', () => {
      const { formatCity } = setup();
      expect(formatCity('Portland')).toBe('Portland');
    });
  });

  describe('formatLanguage', () => {
    test('maps the base language subtag', () => {
      const { formatLanguage } = setup();
      expect(formatLanguage('en-US')).toBe('English');
      expect(formatLanguage('en')).toBe('English');
    });

    test('returns the original value when unknown', () => {
      const { formatLanguage } = setup();
      expect(formatLanguage('xx-YY')).toBe('xx-YY');
    });
  });

  describe('formatValue', () => {
    test('dispatches to the correct formatter by type', () => {
      const { formatValue } = setup();
      expect(formatValue('Mac OS', 'os')).toBe('macOS');
      expect(formatValue('chrome', 'browser')).toBe('Chrome');
      expect(formatValue('mobile', 'device')).toBe('Mobile');
      expect(formatValue('US', 'country')).toBe('United States');
      expect(formatValue('US-CA', 'region')).toBe('California, United States');
      expect(formatValue('en-US', 'language')).toBe('English');
    });

    test('passes the country from data through for city', () => {
      const { formatValue } = setup();
      expect(formatValue('Portland', 'city', { country: 'US' })).toBe('Portland, United States');
    });

    test('returns the raw string for unknown types', () => {
      const { formatValue } = setup();
      expect(formatValue('anything', 'unknownType')).toBe('anything');
    });

    test('returns undefined for a non-string value with an unknown type', () => {
      const { formatValue } = setup();
      expect(formatValue(123 as unknown as string, 'unknownType')).toBeUndefined();
    });
  });
});
