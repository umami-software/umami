import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import InsightsParameters from './InsightsParameters';
import InsightsTable from './InsightsTable';
import Lightbulb from 'assets/lightbulb.svg';

const defaultParameters = {
  type: 'insights',
  parameters: { fields: [], filters: [], groups: [] },
};

export default function InsightsReport({ reportId }) {
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
