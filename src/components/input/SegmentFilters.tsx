import { List, ListItem } from '@umami/react-zen';
import { useWebsiteSegmentsQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export interface SegmentFiltersProps {
  websiteId: string;
  segmentId: string;
  onSave?: (data: any) => void;
}

export function SegmentFilters({ websiteId, segmentId, onSave }: SegmentFiltersProps) {
  const { data, isLoading, isFetching } = useWebsiteSegmentsQuery(websiteId, { type: 'segment' });

  const handleChange = (id: string) => {
    onSave?.(id);
  };

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} overflowY="auto">
      <List selectionMode="single" value={[segmentId]} onChange={id => handleChange(id[0])}>
        {data?.data?.map(item => {
          return (
            <ListItem key={item.id} id={item.id}>
              {item.name}
            </ListItem>
          );
        })}
      </List>
    </LoadingPanel>
  );
}
