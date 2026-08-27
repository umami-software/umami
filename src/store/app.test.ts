import { beforeEach, describe, expect, test } from 'vitest';
import {
  setConfig,
  setDateRangeValue,
  setLocale,
  setShareData,
  setTimezone,
  setUser,
  useApp,
} from './app';

const initialState = { ...useApp.getState() };

beforeEach(() => {
  useApp.setState({ ...initialState }, true);
});

describe('setTimezone', () => {
  test('updates the timezone', () => {
    setTimezone('America/New_York');
    expect(useApp.getState().timezone).toBe('America/New_York');
  });

  test('leaves other fields untouched', () => {
    setTimezone('UTC');
    expect(useApp.getState().locale).toBe(initialState.locale);
  });
});

describe('setLocale', () => {
  test('updates the locale', () => {
    setLocale('fr-FR');
    expect(useApp.getState().locale).toBe('fr-FR');
  });
});

describe('setShareData', () => {
  test('sets both share and shareToken', () => {
    const share = { id: 'share-1' };
    const shareToken = { token: 'abc' };
    setShareData(share, shareToken);

    const state = useApp.getState();
    expect(state.share).toBe(share);
    expect(state.shareToken).toBe(shareToken);
  });

  test('clears share data with nulls', () => {
    setShareData({ id: 'share-1' }, { token: 'abc' });
    setShareData(null, null);

    const state = useApp.getState();
    expect(state.share).toBeNull();
    expect(state.shareToken).toBeNull();
  });
});

describe('setUser', () => {
  test('sets the user object', () => {
    const user = { id: 'user-1' };
    setUser(user);
    expect(useApp.getState().user).toBe(user);
  });
});

describe('setConfig', () => {
  test('sets the config object', () => {
    const config = { cloudMode: true };
    setConfig(config);
    expect(useApp.getState().config).toBe(config);
  });
});

describe('setDateRangeValue', () => {
  test('updates the date range value', () => {
    setDateRangeValue('7day');
    expect(useApp.getState().dateRangeValue).toBe('7day');
  });
});
