import FilterLink from 'components/common/FilterLink';
import { useCountryNames } from 'components/hooks';
import { useLocale, useMessages, useFormat } from 'components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import TypeIcon from 'components/common/TypeIcon';

export function CountriesTable({
  onDataLoad,
  ...props
}: {
  onDataLoad: (data: any) => void;
} & MetricsTableProps) {
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { formatMessage, labels } = useMessages();
  const { formatCountry } = useFormat();

  const handleDataLoad = (data: any) => {
    onDataLoad?.(data);
  };

  const renderLink = ({ x: code }) => {
    return (
      <FilterLink
        id="country"
        className={locale}
        value={countryNames[code] && code}
        label={formatCountry(code)}
      >
        <TypeIcon type="country" value={code?.toLowerCase()} />
      </FilterLink>
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.countries)}
      type="country"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
      onDataLoad={handleDataLoad}
    />
  );
}

export default CountriesTable;
