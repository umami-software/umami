import FunnelReport from './FunnelReport';
import { Metadata } from 'next';

export default function FunnelReportPage() {
  return <FunnelReport />;
}

export const metadata: Metadata = {
  title: 'Funnel Report | Umami',
};
