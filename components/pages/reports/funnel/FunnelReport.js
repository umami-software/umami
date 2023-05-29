import { useContext } from 'react';
import FunnelChart from './FunnelChart';
import FunnelTable from './FunnelTable';
import FunnelParameters from './FunnelParameters';
import Report, { ReportContext } from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import Funnel from 'assets/funnel.svg';
import { useReport } from 'hooks';

const defaultParameters = {
  type: 'funnel',
  parameters: { window: 60, urls: ['/', '/docs'] },
};

export default function FunnelReport({ reportId }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Funnel />} />
      <ReportMenu>
        <FunnelParameters />
      </ReportMenu>
      <ReportBody>
        <FunnelChart />
        <FunnelTable />
      </ReportBody>
    </Report>
  );
}
