import FunnelReport from './funnel/FunnelReport';
import EventDataReport from './event-data/EventDataReport';
import RetentionReport from './retention/RetentionReport';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  retention: RetentionReport,
};

export default function ReportDetails({ reportId, reportType }) {
  const Report = reports[reportType];

  return <Report reportId={reportId} />;
}
