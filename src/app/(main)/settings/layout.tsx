import { Metadata } from 'next';
import { SettingsLayout } from './SettingsLayout';

export default function ({ children }) {
  if (process.env.cloudMode) {
    //return null;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Settings | Umami',
    default: 'Settings | Umami',
  },
};
