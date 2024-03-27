import SettingsLayout from './SettingsLayout';
import { Metadata } from 'next';

export default function ({ children }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

export const metadata: Metadata = {
  title: {
    template: `%s | Settings | ${process.env.NEXT_PUBLIC_CUSTOM_TITLE || 'Umami'}`,
    default: `Settings | ${process.env.NEXT_PUBLIC_CUSTOM_TITLE || 'Umami'}`,
  },
};
