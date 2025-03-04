import { Icons } from '@/components/icons';
import { REPORT_TYPES } from '@/lib/constants';
import { Report } from '../[reportId]/Report';
import { ReportBody } from '../[reportId]/ReportBody';
import { ReportHeader } from '../[reportId]/ReportHeader';
import { ReportMenu } from '../[reportId]/ReportMenu';
import { RevenueParameters } from './RevenueParameters';
import { RevenueView } from './RevenueView';

const defaultParameters = {
  type: REPORT_TYPES.revenue,
  parameters: {},
};

export function RevenueReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Icons.Money />} />
      <ReportMenu>
        <RevenueParameters />
      </ReportMenu>
      <ReportBody>
        <RevenueView />
      </ReportBody>
    </Report>
  );
}
