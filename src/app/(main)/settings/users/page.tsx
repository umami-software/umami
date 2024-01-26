import { Metadata } from 'next';
import UsersDataTable from './UsersDataTable';
import UsersHeader from './UsersHeader';

export default function () {
  return (
    <>
      <UsersHeader />
      <UsersDataTable />
    </>
  );
}
export const metadata: Metadata = {
  title: 'Users | umami',
};
