import MetricsTable from './MetricsTable';
import { emptyFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';

export function CitiesTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();

  function renderLink({ x }) {
    return (
      <div className={locale}>
        <FilterLink id="city" value={x} />
      </div>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.cities)}
      type="city"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
      dataFilter={emptyFilter}
      renderLabel={renderLink}
    />
  );
}

export default CitiesTable;
