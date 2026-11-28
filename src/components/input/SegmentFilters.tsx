import { List, ListItem } from '@umami/react-zen';
import { IconLabel } from '@/components/common/IconLabel';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useWebsiteSegmentsQuery } from '@/components/hooks';
import { ChartPie, UserPlus } from '@/components/icons';

export interface SegmentFiltersProps {
  websiteId?: string;
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
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isEmpty={!data?.data?.length}
    >
      <List selectionMode="single" value={[segmentId]} onValueChange={ids => handleChange(ids[0])}>
        {data?.data?.map(item => {
          return (
            <ListItem key={item.id} value={item.id}>
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
