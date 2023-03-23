import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'hooks/useMessages';

export default function DevicesTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

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
