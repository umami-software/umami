import { Metadata } from 'next';
import JourneyReportPage from './JourneyReportPage';

export default function () {
  return <JourneyReportPage />;
}

export const metadata: Metadata = {
  title: 'Journey Report',
};
