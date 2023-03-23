import MetricsTable from './MetricsTable';
import { percentFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import useCountryNames from 'hooks/useCountryNames';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';

export default function CountriesTable({ websiteId, onDataLoad, ...props }) {
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const { formatMessage, labels } = useMessages();

  function renderLink({ x: code }) {
    return (
      <div className={locale}>
        <FilterLink
          id="country"
          value={code}
          label={countryNames[code] ?? formatMessage(labels.unknown)}
        />
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
      onDataLoad={data => onDataLoad?.(percentFilter(data))}
      renderLabel={renderLink}
    />
  );
}
