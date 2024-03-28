import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages, useFormat } from 'components/hooks';

export function OSTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatOS } = useFormat();

  function renderLink({ x: os }) {
    return (
      <FilterLink id="os" value={os} label={formatOS(os)}>
        <img
          src={`${process.env.basePath || ''}/images/os/${
            os?.toLowerCase()?.replaceAll(/\W/g, '-') || 'unknown'
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
      type="os"
      title={formatMessage(labels.os)}
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default OSTable;
