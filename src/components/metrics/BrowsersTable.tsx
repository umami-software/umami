import FilterLink from 'components/common/FilterLink';
import MetricsTable, { MetricsTableProps } from 'components/metrics/MetricsTable';
import useMessages from 'components/hooks/useMessages';
import useFormat from 'components/hooks/useFormat';

export function BrowsersTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatBrowser } = useFormat();

  function renderLink({ x: browser }) {
    return (
      <FilterLink id="browser" value={browser} label={formatBrowser(browser)}>
        <img
          src={`${process.env.basePath}/images/browsers/${browser || 'unknown'}.png`}
          alt={browser}
          width={16}
          height={16}
        />
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
