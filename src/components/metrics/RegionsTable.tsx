import FilterLink from 'components/common/FilterLink';
import { emptyFilter } from 'lib/filters';
import { useMessages, useRegionNames } from 'components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import TypeIcon from 'components/common/TypeIcon';

export function RegionsTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { getRegionName } = useRegionNames();

  const renderLink = ({ x: code, country }) => {
    return (
      <FilterLink id="region" value={code} label={getRegionName(code, country)}>
        <TypeIcon type="country" value={country?.toLowerCase()} />
      </FilterLink>
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.regions)}
      type="region"
      metric={formatMessage(labels.visitors)}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    />
  );
}

export default RegionsTable;
