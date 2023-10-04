import UsersDataTable from './UsersDataTable';
import { Metadata } from 'next';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

  return <UsersDataTable />;
}
export const metadata: Metadata = {
  title: 'Users | umami',
};
