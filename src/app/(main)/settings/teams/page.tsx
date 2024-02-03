import { Metadata } from 'next';
import TeamsDataTable from './TeamsDataTable';
import TeamsHeader from './TeamsHeader';

export default function () {
  return (
    <>
      <TeamsHeader />
      <TeamsDataTable />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Teams Settings - Umami',
};
