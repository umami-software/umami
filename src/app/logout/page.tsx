import LogoutPage from './LogoutPage';
import { Metadata } from 'next';

export default function () {
  if (process.env.DISABLE_LOGIN) {
    return null;
  }

  return <LogoutPage />;
}

export const metadata: Metadata = {
  title: 'Logout',
};
