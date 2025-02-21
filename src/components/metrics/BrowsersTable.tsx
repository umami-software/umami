import FilterLink from '@/components/common/FilterLink';
import MetricsTable, { MetricsTableProps } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';
import { useFormat } from '@/components/hooks';
import TypeIcon from '@/components/common/TypeIcon';

export function BrowsersTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatBrowser } = useFormat();

  function renderLink({ x: browser }) {
    return (
      <FilterLink id="browser" value={browser} label={formatBrowser(browser)}>
        <TypeIcon type="browser" value={browser} />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.browsers)}
      type="browser"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default BrowsersTable;
