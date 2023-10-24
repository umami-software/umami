import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'components/hooks/useMessages';

export function OSTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: os }) {
    return (
      <FilterLink id="os" value={os}>
        <img
          src={`${process.env.basePath}/images/os/${
            os?.toLowerCase().replaceAll(/[^\w]+/g, '-') || 'unknown'
          }.png`}
          alt={os}
          width={16}
          height={16}
        />
      </FilterLink>
    );
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
