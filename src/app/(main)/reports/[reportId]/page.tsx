import { Metadata } from 'next';
import ReportPage from './ReportPage';

export default function ({ params: { reportId } }) {
  return <ReportPage reportId={reportId} />;
}

export const metadata: Metadata = {
  title: 'Reports',
};
