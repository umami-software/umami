import { useIntl } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { labels } from 'components/messages';

export default function OSTable({ websiteId, ...props }) {
  const { formatMessage } = useIntl();

  function renderLink({ x: os }) {
    return <FilterLink id="os" value={os} />;
  }

  return (
    <MetricsTable
      {...props}
      websiteId={websiteId}
      title={formatMessage(labels.os)}
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
      type="os"
    />
  );
}
