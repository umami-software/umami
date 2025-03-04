import { FunnelChart } from './FunnelChart';
import { FunnelParameters } from './FunnelParameters';
import { Report } from '../[reportId]/Report';
import { ReportHeader } from '../[reportId]/ReportHeader';
import { ReportMenu } from '../[reportId]/ReportMenu';
import { ReportBody } from '../[reportId]/ReportBody';
import { Icons } from '@/components/icons';
import { REPORT_TYPES } from '@/lib/constants';

const defaultParameters = {
  type: REPORT_TYPES.funnel,
  parameters: { window: 60, steps: [] },
};

export function FunnelReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Icons.Funnel />} />
      <ReportMenu>
        <FunnelParameters />
      </ReportMenu>
      <ReportBody>
        <FunnelChart />
      </ReportBody>
    </Report>
  );
}
