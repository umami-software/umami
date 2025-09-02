import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { useMessages } from '@/components/hooks';

export interface EventsTableProps extends MetricsTableProps {
  onLabelClick?: (value: string) => void;
}

export function EventsTable({ onLabelClick, ...props }: EventsTableProps) {
  const { formatMessage, labels } = useMessages();

  const handleDataLoad = (data: any) => {
    props.onDataLoad?.(data);
  };

  const renderLabel = ({ x: label }) => {
    if (onLabelClick) {
      return (
        <div onClick={() => onLabelClick(label)} style={{ cursor: 'pointer' }}>
          {label}
        </div>
      );
    }

    return label;
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.events)}
      type="event"
      metric={formatMessage(labels.actions)}
      onDataLoad={handleDataLoad}
      renderLabel={renderLabel}
      allowDownload={false}
    />
  );
}

export default EventsTable;
