import FunnelReport from './funnel/FunnelReport';
import EventDataReport from './event-data/EventDataReport';
import InsightsReport from './insights/InsightsReport';
import RetentionReport from './retention/RetentionReport';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  insights: InsightsReport,
  retention: RetentionReport,
};

export default function ReportDetails({ reportId, reportType }) {
  const Report = reports[reportType];

  return <Report reportId={reportId} />;
}
