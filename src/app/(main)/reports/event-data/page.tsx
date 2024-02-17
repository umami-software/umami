import { Metadata } from 'next';
import EventDataReportPage from './EventDataReportPage';

export default function () {
  return <EventDataReportPage />;
}

export const metadata: Metadata = {
  title: 'Event Data Report',
};
