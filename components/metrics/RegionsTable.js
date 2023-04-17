import MetricsTable from './MetricsTable';
import { emptyFilter } from 'lib/filters';
import FilterLink from 'components/common/FilterLink';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';
import regions from 'public/iso-3166-2.json';

export default function RegionsTable({ websiteId, ...props }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();

  function renderLink({ x }) {
    return (
      <div className={locale}>
        <FilterLink id="region" value={x} label={regions[x] || x} />
      </div>
    );
  }

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
