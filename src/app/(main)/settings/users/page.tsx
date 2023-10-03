import UsersList from 'app/(main)/settings/users/UsersList';
import { Metadata } from 'next';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return <UsersList />;
}
export const metadata: Metadata = {
  title: 'Users | umami',
};
