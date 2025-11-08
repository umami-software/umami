import { Metadata } from 'next';
import { UsersPage } from './UsersPage';

export default function () {
  return <UsersPage />;
}
export const metadata: Metadata = {
  title: 'Users',
};
