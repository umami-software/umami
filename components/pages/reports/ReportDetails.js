import FunnelReport from './funnel/FunnelReport';
import EventDataReport from './event-data/EventDataReport';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
};

export default function ReportDetails({ reportId, reportType }) {
  const Report = reports[reportType];

  return <Report reportId={reportId} />;
}
