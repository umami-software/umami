import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages, useFormat } from 'components/hooks';
import TypeIcon from 'components/common/TypeIcon';

export function OSTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatOS } = useFormat();

  function renderLink({ x: os }) {
    return (
      <FilterLink id="os" value={os} label={formatOS(os)}>
        <TypeIcon type="os" value={os?.toLowerCase()?.replaceAll(/\W/g, '-')} />
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
