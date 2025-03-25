import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { emptyFilter } from '@/lib/filters';
import FilterLink from '@/components/common/FilterLink';
import { useMessages } from '@/components/hooks';
import { useFormat } from '@/components/hooks';

export function CitiesTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatCity } = useFormat();

  const renderLink = ({ x: city, country }) => {
    return (
      <FilterLink id="city" value={city} label={formatCity(city, country)}>
        {country && (
          <img
            src={`${process.env.basePath || ''}/images/country/${
              country?.toLowerCase() || 'xx'
            }.png`}
            alt={country}
          />
        )}
      </FilterLink>
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.cities)}
      type="city"
      metric={formatMessage(labels.visitors)}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
      searchFormattedValues={true}
    />
  );
}

export default CitiesTable;
