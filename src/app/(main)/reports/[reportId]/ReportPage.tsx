'use client';
import FunnelReport from '../funnel/FunnelReport';
import EventDataReport from '../event-data/EventDataReport';
import InsightsReport from '../insights/InsightsReport';
import RetentionReport from '../retention/RetentionReport';
import UTMReport from '../utm/UTMReport';
import { useReport } from 'components/hooks';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  insights: InsightsReport,
  retention: RetentionReport,
  utm: UTMReport,
};

export default function ReportPage({ reportId }: { reportId: string }) {
  const { report } = useReport(reportId);

  if (!report) {
    return null;
  }

  const ReportComponent = reports[report.type];

  return <ReportComponent reportId={reportId} />;
}
