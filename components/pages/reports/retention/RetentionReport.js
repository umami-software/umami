import RetentionTable from './RetentionTable';
import RetentionParameters from './RetentionParameters';
import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import Magnet from 'assets/magnet.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.retention,
  parameters: {},
};

export default function RetentionReport({ reportId }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Magnet />} />
      <ReportMenu>
        <RetentionParameters />
      </ReportMenu>
      <ReportBody>
        <RetentionTable />
      </ReportBody>
    </Report>
  );
}
