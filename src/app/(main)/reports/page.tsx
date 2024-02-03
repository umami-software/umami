import ReportsHeader from './ReportsHeader';
import ReportsDataTable from './ReportsDataTable';

export default function ({ params: { teamId } }: { params: { teamId: string } }) {
  return (
    <>
      <ReportsHeader />
      <ReportsDataTable teamId={teamId} />
    </>
  );
}
export const metadata = {
  title: 'Reports | Umami',
};
