import { Metadata } from 'next';
import TeamsDataTable from './TeamsDataTable';
import TeamsHeader from './TeamsHeader';

export default function () {
  if (process.env.cloudMode) {
    return null;
  }

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
