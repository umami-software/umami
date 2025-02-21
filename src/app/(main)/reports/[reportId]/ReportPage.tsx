'use client';
import { useReport } from '@/components/hooks';
import EventDataReport from '../event-data/EventDataReport';
import FunnelReport from '../funnel/FunnelReport';
import GoalReport from '../goals/GoalsReport';
import InsightsReport from '../insights/InsightsReport';
import JourneyReport from '../journey/JourneyReport';
import RetentionReport from '../retention/RetentionReport';
import UTMReport from '../utm/UTMReport';
import RevenueReport from '../revenue/RevenueReport';

const reports = {
  funnel: FunnelReport,
  'event-data': EventDataReport,
  insights: InsightsReport,
  retention: RetentionReport,
  utm: UTMReport,
  goals: GoalReport,
  journey: JourneyReport,
  revenue: RevenueReport,
};

export default function ReportPage({ reportId }: { reportId: string }) {
  const { report } = useReport(reportId);

  if (!report) {
    return null;
  }

  const ReportComponent = reports[report.type];

  return <ReportComponent reportId={reportId} />;
}
