import FilterLink from 'components/common/FilterLink';
import { emptyFilter } from 'lib/filters';
import { useMessages, useLocale, useRegionNames } from 'components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import TypeIcon from 'components/common/TypeIcon';

export function RegionsTable(props: MetricsTableProps) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { getRegionName } = useRegionNames(locale);

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
      searchFormattedValues={true}
    />
  );
}

export default RegionsTable;
