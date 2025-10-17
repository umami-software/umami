import { Metadata } from 'next';
import OIDCSettingsPage from '@/app/(main)/settings/OIDCSettingsPage';

export default function () {
  return <OIDCSettingsPage />;
}

export const metadata: Metadata = {
  title: 'OIDC',
};
