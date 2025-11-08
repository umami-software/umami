import { Metadata } from 'next';
import { LogoutPage } from './LogoutPage';

export default function () {
  if (process.env.DISABLE_LOGIN || process.env.CLOUD_MODE) {
    return null;
  }

  return <LogoutPage />;
}

export const metadata: Metadata = {
  title: 'Logout',
};
