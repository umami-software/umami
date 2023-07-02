import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import EventDataParameters from './EventDataParameters';
import Nodes from 'assets/nodes.svg';
import EventDataTable from './EventDataTable';

const defaultParameters = {
  type: 'event-data',
  parameters: { fields: [], filters: [], groups: [] },
};

export default function EventDataReport({ reportId }) {
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
