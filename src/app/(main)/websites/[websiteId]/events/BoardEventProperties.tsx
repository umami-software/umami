import { Empty } from '@/components/common/Empty';
import { useMessages } from '@/components/hooks';
import { PropertyChart } from '@/components/property-data/PropertyChart';
import { DATA_TYPE } from '@/lib/constants';

export function BoardEventProperties({
  websiteId,
  eventName,
  propertyName,
  limit = 10,
  dataType,
}: {
  websiteId: string;
  eventName?: string;
  propertyName?: string;
  limit?: number | string;
  dataType?: number | string;
}) {
  const { t, labels } = useMessages();

  if (!eventName || !propertyName) {
    return <Empty message={t(labels.selectEvent)} />;
  }

  return (
    <PropertyChart
      key={`${eventName}:${propertyName}`}
      source="event"
      websiteId={websiteId}
      eventName={eventName}
      propertyName={propertyName}
      seriesType={Number(dataType) === DATA_TYPE.array ? 'array' : 'property'}
      showSeriesChart={false}
      limit={Number(limit) || 10}
    />
  );
}
