import InsightsReport from './InsightsReport';
import { Metadata } from 'next';

export default function InsightsReportPage() {
  return <InsightsReport reportId={null} />;
}

export const metadata: Metadata = {
  title: 'Insights Report | umami',
};
