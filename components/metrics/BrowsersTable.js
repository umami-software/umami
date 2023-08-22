import { useRouter } from 'next/router';
import FilterLink from 'components/common/FilterLink';
import MetricsTable from 'components/metrics/MetricsTable';
import useMessages from 'hooks/useMessages';
import useFormat from 'hooks/useFormat';

export function BrowsersTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();
  const { basePath } = useRouter();
  const { formatBrowser } = useFormat();

  function renderLink({ x: browser }) {
    return (
      <FilterLink id="browser" value={browser} label={formatBrowser(browser)}>
        <img
          src={`${basePath}/images/browsers/${browser || 'unknown'}.png`}
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
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}

export default BrowsersTable;
