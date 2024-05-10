import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { emptyFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import { useLocale } from 'components/hooks';
import { useMessages } from 'components/hooks';
import { useCountryNames } from 'components/hooks';

export function CitiesTable(props: MetricsTableProps) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const countryNames = useCountryNames(locale);

  const renderLabel = (city: string, country: string) => {
    const countryName = countryNames[country];
    return countryName ? `${city}, ${countryName}` : city;
  };

  const renderLink = ({ x: city, country }) => {
    return (
      <FilterLink id="city" value={city} label={renderLabel(city, country)}>
        {country && (
          <img
            width="20px"
            src={`${process.env.basePath}/images/flags/${country?.toLowerCase() || 'xx'}.png`}
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
    />
  );
}

export default CitiesTable;
