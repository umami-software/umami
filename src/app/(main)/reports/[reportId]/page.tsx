import ReportDetails from './ReportDetails';
import { Metadata } from 'next';

export default function ReportDetailsPage({ params: { reportId } }) {
  if (!reportId) {
    return null;
  }

  return <ReportDetails reportId={reportId} />;
}

export const metadata: Metadata = {
  title: 'Reports | umami',
};
