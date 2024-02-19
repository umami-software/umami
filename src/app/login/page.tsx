import { Metadata } from 'next';
import LoginPage from './LoginPage';

export default async function () {
  return <LoginPage />;
}

export const metadata: Metadata = {
  title: 'Login',
};
