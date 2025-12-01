import { IconLabel, List, ListItem } from '@umami/react-zen';
import { useWebsiteSegmentsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Empty } from '@/components/common/Empty';
import { ChartPie, UserPlus } from '@/components/icons';

export interface SegmentFiltersProps {
  websiteId: string;
  segmentId: string;
  type?: string;
  onChange?: (id: string, type: string) => void;
}

export function SegmentFilters({
  websiteId,
  segmentId,
  type = 'segment',
  onChange,
}: SegmentFiltersProps) {
  const { data, isLoading, isFetching } = useWebsiteSegmentsQuery(websiteId, { type });

  const handleChange = (id: string) => {
    onChange?.(id, type);
  };

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} overflowY="auto">
      {data?.data?.length === 0 && <Empty />}
      <List selectionMode="single" value={[segmentId]} onChange={id => handleChange(id[0])}>
        {data?.data?.map(item => {
          return (
            <ListItem key={item.id} id={item.id}>
              <IconLabel icon={type === 'segment' ? <ChartPie /> : <UserPlus />}>
                {item.name}
              </IconLabel>
            </ListItem>
          );
        })}
      </List>
    </LoadingPanel>
  );
}
