import Money from '@/assets/money.svg';
import { REPORT_TYPES } from '@/lib/constants';
import Report from '../[reportId]/Report';
import ReportBody from '../[reportId]/ReportBody';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import AttributionParameters from './AttributionParameters';
import AttributionView from './AttributionView';

const defaultParameters = {
  type: REPORT_TYPES.attribution,
  parameters: { model: 'firstClick', steps: [] },
};

export default function AttributionReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Money />} />
      <ReportMenu>
        <AttributionParameters />
      </ReportMenu>
      <ReportBody>
        <AttributionView />
      </ReportBody>
    </Report>
  );
}
