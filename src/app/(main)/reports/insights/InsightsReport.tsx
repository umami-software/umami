import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import InsightsParameters from './InsightsParameters';
import InsightsTable from './InsightsTable';
import Lightbulb from 'assets/lightbulb.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.insights,
  parameters: { fields: [], filters: [] },
};

export default function InsightsReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Lightbulb />} />
      <ReportMenu>
        <InsightsParameters />
      </ReportMenu>
      <ReportBody>
        <InsightsTable />
      </ReportBody>
    </Report>
  );
}
