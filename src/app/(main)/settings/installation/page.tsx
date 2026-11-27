import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { InstallationPage } from './InstallationPage';

export default function () {
  if (!getConfig().settingsEnabled) {
    notFound();
  }

  return <InstallationPage />;
}

export const metadata: Metadata = {
  title: 'Installation',
};
