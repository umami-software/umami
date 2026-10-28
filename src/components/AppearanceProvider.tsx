'use client';
import { useTheme } from '@umami/react-zen';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useApi } from '@/components/hooks';
import { applyAppearance } from '@/lib/appearance';
import { getClientAuthToken } from '@/lib/client';
import { loadLocalAppearance, setAppearance, useAppearanceStore } from '@/store/appearance';

/**
 * Applies the user's appearance (light/dark/system, accent, glass intensity) to <html>.
 * Local cache is applied immediately (no flash); the server copy then wins when it exists.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const settings = useAppearanceStore(state => state.preview ?? state.settings);
  const setTheme = useTheme(state => state.setTheme);
  const { get } = useApi();
  const pathname = usePathname();
  // Share/embed pages pick their own theme from the share parameters.
  const ownsTheme = /^\/(share|embed)\//.test(pathname || '');

  useEffect(() => {
    setAppearance(loadLocalAppearance(), false);

    if (ownsTheme || !getClientAuthToken()) {
      return;
    }

    get('/me/appearance')
      .then(res => res?.settings && setAppearance(res.settings))
      .catch(() => null);
  }, []);

  useEffect(() => {
    applyAppearance(settings);

    if (ownsTheme) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const dark = settings.mode === 'dark' || (settings.mode === 'system' && media.matches);
      setTheme(dark ? 'dark' : 'light');
    };

    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [settings, setTheme, ownsTheme]);

  return <>{children}</>;
}
