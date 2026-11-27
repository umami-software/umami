import { useTheme } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import type { ThemeMode } from '@/components/input/ThemeModeSelector';

const THEME_STORAGE_KEY = 'theme';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getThemeMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function useThemeMode() {
  // Changing the preference can leave the resolved theme unchanged.
  const themeState = useTheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    setMode(getThemeMode());
  }, [themeState]);

  const setThemeMode = (mode: ThemeMode) => {
    if (mode === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
      themeState.initTheme(undefined, 'system');
    } else {
      themeState.setTheme(mode);
    }
  };

  return { mode, setThemeMode };
}

export function useSystemTheme() {
  useEffect(() => {
    const query = window.matchMedia(DARK_SCHEME_QUERY);
    const applySystemTheme = () => {
      const { theme, initTheme } = useTheme.getState();

      if (getThemeMode() === 'system' && theme !== (query.matches ? 'dark' : 'light')) {
        initTheme(undefined, 'system');
      }
    };

    query.addEventListener('change', applySystemTheme);
    return () => query.removeEventListener('change', applySystemTheme);
  }, []);
}
