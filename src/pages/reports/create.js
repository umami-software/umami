import AppLayout from 'components/layout/AppLayout';
import ReportTemplates from 'components/pages/reports/ReportTemplates';
import { useMessages } from 'components/hooks';

export default function () {
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <ReportTemplates />
    </AppLayout>
  );
}
