import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages } from 'components/hooks';
import { useFormat } from 'components/hooks';
import TypeIcon from 'components/common/TypeIcon';

export function DevicesTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatDevice } = useFormat();

  function renderLink({ x: device }) {
    return (
      <FilterLink id="device" value={labels[device] && device} label={formatDevice(device)}>
        <TypeIcon type="device" value={device?.toLowerCase()} />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.devices)}
      type="device"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
      searchFormattedValues={true}
    />
  );
}

export default DevicesTable;
