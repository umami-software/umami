import { Metadata } from 'next';
import UsersSettingsPage from './UsersSettingsPage';

export default function () {
  return <UsersSettingsPage />;
}
export const metadata: Metadata = {
  title: 'Users',
};
