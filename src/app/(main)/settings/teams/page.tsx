import { Metadata } from 'next';
import { TeamsSettingsPage } from './TeamsSettingsPage';

export default function () {
  return <TeamsSettingsPage />;
}

export const metadata: Metadata = {
  title: 'Teams',
};
