import { useRouter } from 'next/router';
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
  const { basePath } = useRouter();

  const renderLabel = x => {
    const [country, ...codes] = x.split('-');
    const region = codes.join('-');
    return regions[region] ? `${regions[region]}, ${countryNames[country]}` : x;
  };

  const renderLink = ({ x: code }) => {
    return (
      <FilterLink id="region" className={locale} value={code} label={renderLabel(code)}>
        <img
          src={`${basePath}/images/flags/${code?.split('-')?.[0]?.toLowerCase() || 'xx'}.png`}
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
