import InsightsReport from './InsightsReport';
import { Metadata } from 'next';

export default function InsightsReportPage() {
  return <InsightsReport />;
}

export const metadata: Metadata = {
  title: 'Insights Report | Umami',
};
