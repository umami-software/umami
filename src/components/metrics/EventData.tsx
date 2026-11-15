import { Column, Grid, Label, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useEventDataQuery } from '@/components/hooks';
import { getDisplayValue } from '@/lib/data';

export function EventData({ websiteId, eventId }: { websiteId: string; eventId: string }) {
  const { data, isLoading, error } = useEventDataQuery(websiteId, eventId);

  return (
    <LoadingPanel isLoading={isLoading} error={error}>
      <Grid columns="1fr 1fr" gap="5">
        {data?.map(row => {
          return (
            <Column key={row.dataKey}>
              <Label>{row.dataKey}</Label>
              <Text>{getDisplayValue(row)}</Text>
            </Column>
          );
        })}
      </Grid>
    </LoadingPanel>
  );
}
