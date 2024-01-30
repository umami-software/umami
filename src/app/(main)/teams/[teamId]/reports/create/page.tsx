import { Metadata } from 'next';
import ReportTemplates from 'app/(main)/reports/create/ReportTemplates';

export default function () {
  return <ReportTemplates />;
}

export const metadata: Metadata = {
  title: 'Create Report | umami',
};
