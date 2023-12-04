import FilterLink from 'components/common/FilterLink';
import useCountryNames from 'components/hooks/useCountryNames';
import { useLocale, useMessages, useFormat } from 'components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';

export function CountriesTable({
  onDataLoad,
  ...props
}: {
  onDataLoad: (data: any) => void;
} & MetricsTableProps) {
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
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
        <img
          src={`${process.env.basePath}/images/flags/${code?.toLowerCase() || 'xx'}.png`}
          alt={code}
        />
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
