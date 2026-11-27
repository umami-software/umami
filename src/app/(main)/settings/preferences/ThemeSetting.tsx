import { Tabs, TabsList, TabsTrigger } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { useSystemTheme, useThemeMode } from '@/components/hooks/useThemeMode';
import { Monitor, Moon, Sun } from '@/components/icons';
import type { ThemeMode } from '@/components/input/ThemeModeSelector';

export function ThemeSetting() {
  const { t, labels } = useMessages();
  const { mode, setThemeMode } = useThemeMode();
  useSystemTheme();

  return (
    <Tabs value={mode} onValueChange={value => setThemeMode(value as ThemeMode)}>
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
