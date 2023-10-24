import MetricsTable from './MetricsTable';
import { emptyFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import useLocale from 'components/hooks/useLocale';
import useMessages from 'components/hooks/useMessages';
import useCountryNames from 'components/hooks/useCountryNames';

export function CitiesTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const countryNames = useCountryNames(locale);

  const renderLabel = (city, country) => {
    const name = countryNames[country];
    return name ? `${city}, ${name}` : city;
  };

  const renderLink = ({ x: city, country }) => {
    return (
      <FilterLink id="city" value={city} label={renderLabel(city, country)}>
        {country && (
          <img
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
      websiteId={websiteId}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    />
  );
}

export default CitiesTable;
