import MetricsTable from './MetricsTable';
import { useIntl } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import { labels } from 'components/messages';

export default function DevicesTable({ websiteId, ...props }) {
  const { formatMessage } = useIntl();

  function renderLink({ x: device }) {
    return (
      <FilterLink
        id="device"
        value={device}
        label={formatMessage(labels[device] || labels.unknown)}
      />
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.devices)}
      type="device"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}
