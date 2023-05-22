import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'hooks/useMessages';

export function OSTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: os }) {
    return <FilterLink id="os" value={os} />;
  }

  return (
    <MetricsTable
      {...props}
      websiteId={websiteId}
      title={formatMessage(labels.os)}
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
      type="os"
    />
  );
}

export default OSTable;
