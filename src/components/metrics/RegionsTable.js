import FilterLink from 'components/common/FilterLink';
import { emptyFilter } from 'lib/filters';
import useLocale from 'components/hooks/useLocale';
import useMessages from 'components/hooks/useMessages';
import useCountryNames from 'components/hooks/useCountryNames';
import MetricsTable from './MetricsTable';
import regions from 'public/iso-3166-2.json';

export function RegionsTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const countryNames = useCountryNames(locale);

  const renderLabel = (code, country) => {
    const region = code.includes('-') ? code : `${country}-${code}`;
    return regions[region] ? `${regions[region]}, ${countryNames[country]}` : region;
  };

  const renderLink = ({ x: code, country }) => {
    return (
      <FilterLink id="region" className={locale} value={code} label={renderLabel(code, country)}>
        <img
          src={`${process.env.basePath}/images/flags/${country?.toLowerCase() || 'xx'}.png`}
          alt={code}
        />
      </FilterLink>
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.regions)}
      type="region"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    />
  );
}

export default RegionsTable;
