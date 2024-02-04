import { Metadata } from 'next';
import EventDataReport from './EventDataReport';

export default function FunnelReportPage() {
  return <EventDataReport />;
}

export const metadata: Metadata = {
  title: 'Funnel Report | Umami',
};
