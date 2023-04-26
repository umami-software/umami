import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';

export function CountriesTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: code }) {
    return (
      <FilterLink
        id="country"
        className={locale}
        value={countryNames[code] && code}
        label={countryNames[code]}
      >
        <img src={`/images/flags/${code?.toLowerCase() || 'xx'}.png`} alt={code} />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.countries)}
      type="country"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}

export default CountriesTable;
