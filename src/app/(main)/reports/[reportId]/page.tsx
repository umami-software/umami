import { Metadata } from 'next';
import ReportPage from './ReportPage';

export default async function ({ params }: { params: { reportId: string } }) {
  const { reportId } = await params;

  return <ReportPage reportId={reportId} />;
}

export const metadata: Metadata = {
  title: 'Reports',
};
