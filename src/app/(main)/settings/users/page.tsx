import UsersDataTable from './UsersDataTable';
import { Metadata } from 'next';

export default function () {
  return <UsersDataTable />;
}
export const metadata: Metadata = {
  title: 'Users | umami',
};
