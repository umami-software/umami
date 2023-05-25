import FunnelChart from './FunnelChart';
import FunnelTable from './FunnelTable';
import FunnelParameters from './FunnelParameters';
import Report from '../Report';
import ReportHeader from '../ReportHeader';
import ReportMenu from '../ReportMenu';
import ReportBody from '../ReportBody';
import Funnel from 'assets/funnel.svg';
import { useReport } from 'hooks';
import useApi from 'hooks/useApi';

export default function FunnelReport({ reportId }) {
  const report = useReport(reportId, { window: 60, urls: ['/', '/docs'] });
  const { post, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(
    ['report:funnel', report?.update],
    () => {
      const { websiteId, parameters } = report || {};

      return post(`/reports/funnel`, {
        websiteId: websiteId,
        ...parameters,
        startAt: +parameters.dateRange.startDate,
        endAt: +parameters.dateRange.endDate,
      });
    },
    { enabled: !!report?.update },
  );

  return (
    <Report error={error} loading={data && isLoading}>
      <ReportHeader icon={<Funnel />} report={report} />
      <ReportMenu>
        <FunnelParameters report={report} />
      </ReportMenu>
      <ReportBody>
        <FunnelChart report={report} data={data} />
        <FunnelTable data={data} />
      </ReportBody>
    </Report>
  );
}
