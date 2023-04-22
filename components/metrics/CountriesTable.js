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
      <div className={locale}>
        <FilterLink id="country" value={countryNames[code] && code} label={countryNames[code]} />
      </div>
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
