import ReportCreatePage from './ReportCreatePage';
import { Metadata } from 'next';

export default function () {
  return <ReportCreatePage />;
}

export const metadata: Metadata = {
  title: 'Create Report',
};
