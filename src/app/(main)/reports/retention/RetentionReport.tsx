import RetentionTable from './RetentionTable';
import RetentionParameters from './RetentionParameters';
import ReportPage from '../[reportId]/ReportPage';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import Magnet from 'assets/magnet.svg';
import { REPORT_TYPES } from 'lib/constants';
import { parseDateRange } from 'lib/date';
import { endOfMonth, startOfMonth } from 'date-fns';

const defaultParameters = {
  type: REPORT_TYPES.retention,
  parameters: {
    dateRange: parseDateRange(
      `range:${startOfMonth(new Date()).getTime()}:${endOfMonth(new Date()).getTime()}`,
    ),
  },
};

export default function RetentionReport({ reportId }: { reportId?: string }) {
  return (
    <ReportPage reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Magnet />} />
      <ReportMenu>
        <RetentionParameters />
      </ReportMenu>
      <ReportBody>
        <RetentionTable />
      </ReportBody>
    </ReportPage>
  );
}
