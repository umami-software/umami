import EventDataReport from './EventDataReport';
import { Metadata } from 'next';

export default function FunnelReportPage() {
  return <EventDataReport />;
}

export const metadata: Metadata = {
  title: 'Funnel Report | Umami',
};
