import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import EventDataParameters from './EventDataParameters';
import Nodes from 'assets/nodes.svg';

const defaultParameters = {
  type: 'event-data',
  parameters: { fields: [], filters: [] },
};

export default function EventDataReport({ reportId }) {
  return (
    <Report reportId={reportId} defaultParameters={defaultParameters}>
      <ReportHeader icon={<Nodes />} />
      <ReportMenu>
        <EventDataParameters />
      </ReportMenu>
      <ReportBody>hi.</ReportBody>
    </Report>
  );
}
