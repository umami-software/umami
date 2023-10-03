import ReportsHeader from './ReportsHeader';
import ReportsList from './ReportsList';

export default function ReportsPage() {
  return (
    <>
      <ReportsHeader />
      <ReportsList />
    </>
  );
}
export const metadata = {
  title: 'Reports | umami',
};
