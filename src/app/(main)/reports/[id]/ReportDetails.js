'use client';
import FunnelReport from '../funnel/FunnelReport';
import EventDataReport from '../event-data/EventDataReport';
import InsightsReport from '../insights/InsightsReport';
import RetentionReport from '../retention/RetentionReport';
import { useApi } from 'components/hooks';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  insights: InsightsReport,
  retention: RetentionReport,
};

export default function ReportDetails({ reportId }) {
  const { get, useQuery } = useApi();
  const { data: report } = useQuery(['reports', reportId], () => get(`/reports/${reportId}`));

  if (!report) {
    return null;
  }

  const ReportComponent = reports[report.type];

  return <ReportComponent reportId={reportId} />;
}
