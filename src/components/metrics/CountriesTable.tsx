import { FilterLink } from '@/components/common/FilterLink';
import { useCountryNames } from '@/components/hooks';
import { useLocale, useMessages, useFormat } from '@/components/hooks';
import { MetricsTable, MetricsTableProps } from './MetricsTable';
import { TypeIcon } from '@/components/common/TypeIcon';
import { MetricsExpandedTable } from '@/components/metrics/MetricsExpandedTable';

export interface CountriesTableProps extends MetricsTableProps {
  isExpanded?: boolean;
}

export function CountriesTable({ isExpanded, ...props }: CountriesTableProps) {
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { formatMessage, labels } = useMessages();
  const { formatCountry } = useFormat();

  const renderLabel = ({ label: code }) => {
    return (
      <FilterLink
        type="country"
        value={(countryNames[code] && code) || code}
        label={formatCountry(code)}
      >
        <TypeIcon type="country" value={code} />
      </FilterLink>
    );
  };

  const Component = isExpanded ? MetricsExpandedTable : MetricsTable;

  return (
    <Component
      {...props}
      title={formatMessage(labels.countries)}
      type="country"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLabel}
      searchFormattedValues={true}
    />
  );
}
