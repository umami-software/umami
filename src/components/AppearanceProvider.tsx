'use client';
import { useTheme } from '@umami/react-zen';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useApi } from '@/components/hooks';
import { applyAppearance, DEFAULT_APPEARANCE } from '@/lib/appearance';
import { getClientAuthToken } from '@/lib/client';
import { useApp } from '@/store/app';
import { loadLocalAppearance, setAppearance, useAppearanceStore } from '@/store/appearance';

/**
 * Applies the user's appearance (light/dark/system, accent, glass intensity) to <html>.
 * Local cache is applied immediately (no flash); the server copy then wins when it exists.
 */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const settings = useAppearanceStore(state => state.preview ?? state.settings);
  const setTheme = useTheme(state => state.setTheme);
  const { get } = useApi();
  const userId = useApp(state => (state.user as { id?: string } | null)?.id);
  const pathname = usePathname();
  // Share/embed pages pick their own theme from the share parameters.
  const ownsTheme = /^\/(share|embed)\//.test(pathname || '');

  // Local cache first (no flash before login / on public pages).
  useEffect(() => {
    setAppearance(loadLocalAppearance(), false);
  }, []);

  // Whenever the signed-in user changes (including SPA login without a reload), load that user's
  // saved appearance; a user with nothing saved gets the defaults, never the previous user's cache.
  useEffect(() => {
    if (ownsTheme || !userId || !getClientAuthToken()) {
      return;
    }

    let cancelled = false;

    get('/me/appearance')
      .then(res => {
        if (!cancelled) {
          setAppearance(res?.settings ? res.settings : { ...DEFAULT_APPEARANCE });
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [userId, ownsTheme]);

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
