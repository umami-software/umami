'use client';
import FunnelChart from './FunnelChart';
import FunnelTable from './FunnelTable';
import FunnelParameters from './FunnelParameters';
import Report from '../[id]/Report';
import ReportHeader from '../[id]/ReportHeader';
import ReportMenu from '../[id]/ReportMenu';
import ReportBody from '../[id]/ReportBody';
import Funnel from 'assets/funnel.svg';
import { REPORT_TYPES } from 'lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.funnel,
  parameters: { window: 60, urls: [] },
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
