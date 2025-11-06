import { Metadata } from 'next';
import { PreferencesPage } from './PreferencesPage';

export default function () {
  return <PreferencesPage />;
}

export const metadata: Metadata = {
  title: 'Preferences',
};
