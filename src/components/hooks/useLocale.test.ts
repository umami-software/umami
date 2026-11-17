import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DEFAULT_TIME_FORMAT, TIME_FORMATS } from '@/lib/constants';
import { httpGet } from '@/lib/fetch';
import { setLocale, setTimeFormat } from '@/store/app';
import enUS from '../../../public/intl/messages/en-US.json';
import { useLocale } from './useLocale';

vi.mock('@/lib/fetch', () => ({ httpGet: vi.fn() }));

describe('useLocale', () => {
  afterEach(() => {
    setTimeFormat(DEFAULT_TIME_FORMAT);
    setLocale('en-US');
  });

  test('re-renders consumers and refreshes dateLocale when the clock format changes', () => {
    const { result } = renderHook(() => useLocale());

    expect(result.current.timeFormat).toBe(DEFAULT_TIME_FORMAT);
    expect(result.current.dateLocale.formatLong.time({ width: 'short' })).toBe('h:mm a');

    act(() => {
      setTimeFormat(TIME_FORMATS.h24);
    });

    expect(result.current.timeFormat).toBe(TIME_FORMATS.h24);
    expect(result.current.dateLocale.formatLong.time({ width: 'short' })).toBe('HH:mm');
  });

  // Translations lag behind new English messages. A missing one must read as English, never
  // as its key (such as "searchConsole.notConnected"), which is what the page would show.
  test('fills every message a translation lacks with English', async () => {
    vi.mocked(httpGet).mockResolvedValue({
      ok: true,
      status: 200,
      data: { label: { add: 'Hinzufügen' }, ads: {} },
    } as any);
    const { result } = renderHook(() => useLocale());

    await act(() => result.current.saveLocale('xx-XX'));
    const loaded = (result.current.messages as Record<string, any>)['xx-XX'];

    expect(loaded.label.add).toBe('Hinzufügen');
    // A key missing from a translated section, an empty section and a missing section.
    expect(loaded.label.account).toBe(enUS.label.account);
    expect(loaded.ads.notConnected).toBe(enUS.ads.notConnected);
    expect(loaded.searchConsole).toEqual(enUS.searchConsole);
  });
});
