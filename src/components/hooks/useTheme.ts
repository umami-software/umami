import { useEffect } from 'react';
import useStore, { setTheme } from 'store/app';
import { getItem, setItem } from 'next-basics';
import { THEME_COLORS, THEME_CONFIG } from 'lib/constants';
import { colord } from 'colord';

const selector = (state: { theme: string }) => state.theme;

export function useTheme() {
  const defaultTheme =
    typeof window !== 'undefined'
      ? window?.matchMedia('(prefers-color-scheme: dark)')?.matches
        ? 'dark'
        : 'light'
      : 'light';
  const theme = useStore(selector) || getItem(THEME_CONFIG) || defaultTheme;
  const primaryColor = colord(THEME_COLORS[theme].primary);

  const colors = {
    theme: {
      ...THEME_COLORS[theme],
    },
    chart: {
      text: THEME_COLORS[theme].gray700,
      line: THEME_COLORS[theme].gray200,
      views: {
        hoverBackgroundColor: primaryColor.alpha(0.7).toRgbString(),
        backgroundColor: primaryColor.alpha(0.4).toRgbString(),
        borderColor: primaryColor.alpha(0.7).toRgbString(),
        hoverBorderColor: primaryColor.toRgbString(),
      },
      visitors: {
        hoverBackgroundColor: primaryColor.alpha(0.9).toRgbString(),
        backgroundColor: primaryColor.alpha(0.6).toRgbString(),
        borderColor: primaryColor.alpha(0.9).toRgbString(),
        hoverBorderColor: primaryColor.toRgbString(),
      },
    },
    map: {
      baseColor: THEME_COLORS[theme].primary,
      fillColor: THEME_COLORS[theme].gray100,
      strokeColor: THEME_COLORS[theme].primary,
      hoverColor: THEME_COLORS[theme].primary,
    },
  };

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

  return { theme, saveTheme, colors };
}

export default useTheme;
