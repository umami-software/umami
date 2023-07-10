import FilterLink from 'components/common/FilterLink';
import MetricsTable from 'components/metrics/MetricsTable';
import { BROWSERS } from 'lib/constants';
import useMessages from 'hooks/useMessages';
import { useRouter } from 'next/router';

export function BrowsersTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();
  const { basePath } = useRouter();

  function renderLink({ x: browser }) {
    return (
      <FilterLink id="browser" value={browser} label={BROWSERS[browser] || browser}>
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
