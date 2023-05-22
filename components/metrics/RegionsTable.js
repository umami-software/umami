import MetricsTable from './MetricsTable';
import { emptyFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';
import useCountryNames from 'hooks/useCountryNames';
import regions from 'public/iso-3166-2.json';

export function RegionsTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const countryNames = useCountryNames(locale);

  const renderLabel = x => {
    return regions[x] ? `${regions[x]}, ${countryNames[x.split('-')[0]]}` : x;
  };

  const renderLink = ({ x: code }) => {
    return (
      <FilterLink id="region" className={locale} value={code} label={renderLabel(code)}>
        <img src={`/images/flags/${code?.split('-')?.[0]?.toLowerCase() || 'xx'}.png`} alt={code} />
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
