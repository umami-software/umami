import FunnelChart from './FunnelChart';
import FunnelTable from './FunnelTable';
import FunnelParameters from './FunnelParameters';
import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import Funnel from 'assets/funnel.svg';
import { useReport } from 'hooks';

export default function FunnelReport({ reportId }) {
  const report = useReport(reportId);

  console.log('REPORT', { report });

  return (
    <Report>
      <ReportHeader icon={<Funnel />} report={report} />
      <ReportMenu>
        <FunnelParameters report={report} />
      </ReportMenu>
      <ReportBody>
        <FunnelChart report={report} />
        <FunnelTable report={report} />
      </ReportBody>
    </Report>
  );
}
