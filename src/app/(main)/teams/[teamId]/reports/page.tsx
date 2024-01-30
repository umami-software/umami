import { Metadata } from 'next';
import ReportsHeader from 'app/(main)/reports/ReportsHeader';
import ReportsDataTable from 'app/(main)/reports/ReportsDataTable';

export default function ({ params: { teamId } }) {
  return (
    <>
      <ReportsHeader />
      <ReportsDataTable teamId={teamId} />
    </>
  );
}
export const metadata: Metadata = {
  title: 'Reports | umami',
};
