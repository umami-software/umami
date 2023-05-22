import { useEffect } from 'react';
import useStore, { setTheme } from 'store/app';
import { getItem, setItem } from 'next-basics';
import { THEME_CONFIG } from 'lib/constants';

const selector = state => state.theme;

export default function useTheme() {
  const defaultTheme =
    typeof window !== 'undefined'
      ? window?.matchMedia('(prefers-color-scheme: dark)')?.matches
        ? 'dark'
        : 'light'
      : 'light';
  const theme = useStore(selector) || getItem(THEME_CONFIG) || defaultTheme;

  function saveTheme(value) {
    setItem(THEME_CONFIG, value);
    setTheme(value);
  }

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const theme = url.searchParams.get('theme');

    if (['light', 'dark'].includes(theme)) {
      saveTheme(theme);
    }
  }, []);

  return [theme, saveTheme];
}
