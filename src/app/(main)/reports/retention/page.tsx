import { Metadata } from 'next';
import RetentionReport from './RetentionReport';

export default function RetentionReportPage() {
  return <RetentionReport reportId={null} />;
}

export const metadata: Metadata = {
  title: 'Create Report | umami',
};
