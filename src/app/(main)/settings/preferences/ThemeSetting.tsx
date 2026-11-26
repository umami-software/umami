import { Tabs, TabsList, TabsTrigger, useTheme } from '@umami/react-zen';
import { useCallback, useEffect, useState } from 'react';
import { useMessages } from '@/components/hooks';
import { Monitor, Moon, Sun } from '@/components/icons';
import type { ThemeMode } from '@/components/input/ThemeModeSelector';

const THEME_STORAGE_KEY = 'theme';
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getThemeMode(): ThemeMode {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null;
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function ThemeSetting() {
  const { t, labels } = useMessages();
  const themeState = useTheme();
  const { initTheme, setTheme } = themeState;
  const [mode, setMode] = useState(getThemeMode);

  const applySystemTheme = useCallback(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    initTheme(undefined, 'system');
  }, [initTheme]);

  const handleChange = (value: ThemeMode) => {
    if (value === 'system') {
      applySystemTheme();
    } else {
      setTheme(value);
    }
    setMode(value);
  };

  useEffect(() => {
    setMode(getThemeMode());
  }, [themeState]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }

    const query = window.matchMedia(DARK_SCHEME_QUERY);
    query.addEventListener('change', applySystemTheme);
    return () => query.removeEventListener('change', applySystemTheme);
  }, [mode, applySystemTheme]);

  return (
    <Tabs value={mode} onValueChange={value => handleChange(value as ThemeMode)}>
      <TabsList>
        <TabsTrigger value="system">
          <Monitor />
          {t(labels.system)}
        </TabsTrigger>
        <TabsTrigger value="light">
          <Sun />
          {t(labels.light)}
        </TabsTrigger>
        <TabsTrigger value="dark">
          <Moon />
          {t(labels.dark)}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
