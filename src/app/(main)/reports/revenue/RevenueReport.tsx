import RevenueChart from './RevenueChart';
import RevenueParameters from './RevenueParameters';
import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import Target from 'assets/target.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.revenue,
  parameters: { Revenue: [] },
};

export default function RevenueReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Target />} />
      <ReportMenu>
        <RevenueParameters />
      </ReportMenu>
      <ReportBody>
        <RevenueChart />
      </ReportBody>
    </Report>
  );
}
