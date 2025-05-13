import Report from '../[reportId]/Report';
import ReportHeader from '../[reportId]/ReportHeader';
import ReportMenu from '../[reportId]/ReportMenu';
import ReportBody from '../[reportId]/ReportBody';
import EventDataParameters from './EventDataParameters';
import EventDataTable from './EventDataTable';
import Nodes from '@/assets/nodes.svg';

const defaultParameters = {
  type: 'event-data',
  parameters: { fields: [], filters: [] },
};

export default function EventDataReport({ reportId }: { reportId?: string }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Nodes />} />
      <ReportMenu>
        <EventDataParameters />
      </ReportMenu>
      <ReportBody>
        <EventDataTable />
      </ReportBody>
    </Report>
  );
}
