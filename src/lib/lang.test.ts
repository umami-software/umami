import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { describe, expect, test } from 'vitest';
import { getDateLocale, getTextDirection } from './lang';

describe('getDateLocale', () => {
  test('returns the configured date-fns locale', () => {
    expect(getDateLocale('fr-FR')).toBe(fr);
  });

  test('formats Galician dates with Galician weekday and month names', () => {
    expect(
      format(new Date(2024, 0, 1), 'EEEE, d MMMM yyyy', {
        locale: getDateLocale('ga-ES'),
      }),
    ).toBe('luns, 1 xaneiro 2024');
  });

  test('falls back to en-US for unknown locales', () => {
    expect(getDateLocale('xx-XX')).toBe(enUS);
  });

  test('falls back to en-US when a language has no dateLocale', () => {
    expect(getDateLocale('fo-FO')).toBe(enUS);
  });
});

describe('getTextDirection', () => {
  test('returns rtl for right-to-left languages', () => {
    expect(getTextDirection('ar-SA')).toBe('rtl');
    expect(getTextDirection('fa-IR')).toBe('rtl');
    expect(getTextDirection('he-IL')).toBe('rtl');
    expect(getTextDirection('ur-PK')).toBe('rtl');
  });

  test('returns ltr for left-to-right languages', () => {
    expect(getTextDirection('en-US')).toBe('ltr');
    expect(getTextDirection('fr-FR')).toBe('ltr');
  });

  test('falls back to ltr for unknown locales', () => {
    expect(getTextDirection('xx-XX')).toBe('ltr');
  });
});
