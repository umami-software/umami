import ReportsHeader from './ReportsHeader';
import ReportsDataTable from './ReportsDataTable';

export default function ReportsPage() {
  return (
    <>
      <ReportsHeader />
      <ReportsDataTable />
    </>
  );
}
export const metadata = {
  title: 'Reports | umami',
};
