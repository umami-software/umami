import GoalsChart from './GoalsChart';
import GoalsParameters from './GoalsParameters';
import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import Target from 'assets/target.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.goals,
  parameters: { goals: [] },
};

export default function GoalsReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Target />} />
      <ReportMenu>
        <GoalsParameters />
      </ReportMenu>
      <ReportBody>
        <GoalsChart />
      </ReportBody>
    </Report>
  );
}
