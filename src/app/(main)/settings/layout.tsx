import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import { SettingsLayout } from './SettingsLayout';

export default function ({ children }) {
  if (!getConfig().settingsEnabled) {
    return null;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Settings | Umami',
    default: 'Settings | Umami',
  },
};
