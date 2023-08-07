import RetentionChart from './RetentionChart';
import RetentionTable from './RetentionTable';
import RetentionParameters from './RetentionParameters';
import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import Funnel from 'assets/funnel.svg';

const defaultParameters = {
  type: 'retention',
  parameters: {},
};

export default function RetentionReport({ reportId }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Funnel />} />
      <ReportMenu>
        <RetentionParameters />
      </ReportMenu>
      <ReportBody>
        {/* <RetentionChart /> */}
        <RetentionTable />
      </ReportBody>
    </Report>
  );
}
