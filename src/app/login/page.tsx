import { Metadata } from 'next';
import LoginPage from './LoginPage';

export default async function () {
  if (process.env.DISABLE_LOGIN) {
    return null;
  }

  return <LoginPage />;
}

export const metadata: Metadata = {
  title: 'Login',
};
