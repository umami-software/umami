import FilterLink from 'components/common/FilterLink';
import MetricsTable from 'components/metrics/MetricsTable';
import { BROWSERS } from 'lib/constants';
import useMessages from 'hooks/useMessages';

export function BrowsersTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: browser }) {
    return <FilterLink id="browser" value={browser} label={BROWSERS[browser] || browser} />;
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.browsers)}
      type="browser"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}

export default BrowsersTable;
