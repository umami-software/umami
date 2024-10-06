import FilterLink from 'components/common/FilterLink';
import { useIntl } from 'react-intl';
import { useMessages, useFormat } from 'components/hooks';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import TypeIcon from 'components/common/TypeIcon';

export function CountriesTable({ ...props }: MetricsTableProps) {
  const intl = useIntl();
  const { formatMessage, labels } = useMessages();
  const { formatCountry } = useFormat();

  const renderLink = ({ x: code }) => {
    return (
      <FilterLink
        id="country"
        value={intl.formatDisplayName(code, { type: 'region' }) && code}
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
    />
  );
}

export default CountriesTable;
