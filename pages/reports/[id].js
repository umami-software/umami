import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import ReportDetails from 'components/pages/reports/ReportDetails';
import { useApi, useMessages } from 'hooks';

export default function () {
  const { formatMessage, labels } = useMessages();
  const router = useRouter();
  const { id } = router.query;
  const { get, useQuery } = useApi();
  const { data: report } = useQuery(['reports', id], () => get(`/reports/${id}`), {
    enabled: !!id,
  });

  if (!id || !report) {
    return null;
  }

  return (
    <AppLayout title={formatMessage(labels.websites)}>
      <ReportDetails reportId={report.id} reportType={report.type} />
    </AppLayout>
  );
}
