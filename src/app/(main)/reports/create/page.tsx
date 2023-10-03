import ReportTemplates from './ReportTemplates';
import { Metadata } from 'next';

export default function ReportsCreatePage() {
  return <ReportTemplates />;
}

export const metadata: Metadata = {
  title: 'Create Report | umami',
};
