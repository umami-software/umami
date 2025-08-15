'use client';
import { useReport } from '@/components/hooks';
import EventDataReport from '../event-data/EventDataReport';
import FunnelReport from '../funnel/FunnelReport';
import GoalReport from '../goals/GoalsReport';
import InsightsReport from '../insights/InsightsReport';
import JourneyReport from '../journey/JourneyReport';
import RetentionReport from '../retention/RetentionReport';
import RevenueReport from '../revenue/RevenueReport';
import UTMReport from '../utm/UTMReport';
import AttributionReport from '../attribution/AttributionReport';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  insights: InsightsReport,
  retention: RetentionReport,
  utm: UTMReport,
  goals: GoalReport,
  journey: JourneyReport,
  revenue: RevenueReport,
  attribution: AttributionReport,
};

export default function ReportPage({ reportId }: { reportId: string }) {
  const { report } = useReport(reportId);

  if (!report) {
    return null;
  }

  const ReportComponent = reports[report.type];

  if (!ReportComponent) {
    return null;
  }

  return <ReportComponent reportId={reportId} />;
}
