import { Metadata } from 'next';
import UTMReportPage from './UTMReportPage';

export default function () {
  return <UTMReportPage />;
}

export const metadata: Metadata = {
  title: 'UTM Report',
};
