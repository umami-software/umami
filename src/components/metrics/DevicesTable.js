import MetricsTable from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import useMessages from 'components/hooks/useMessages';
import { useFormat } from 'components/hooks';

export function DevicesTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();
  const { formatDevice } = useFormat();

  function renderLink({ x: device }) {
    return (
      <FilterLink id="device" value={labels[device] && device} label={formatDevice(device)}>
        <img
          src={`${process.env.basePath}/images/device/${device?.toLowerCase() || 'unknown'}.png`}
          alt={device}
          width={16}
          height={16}
        />
      </FilterLink>
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

export default DevicesTable;
