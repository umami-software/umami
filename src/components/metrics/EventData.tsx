import { Grid, Column, Text, Label } from '@umami/react-zen';
import { useEventDataQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export function EventData({ websiteId, eventId }: { websiteId: string; eventId: string }) {
  const { data, isLoading, error } = useEventDataQuery(websiteId, eventId);

  return (
    <LoadingPanel isLoading={isLoading} error={error}>
      <Grid columns="1fr 1fr" gap="5">
        {data?.map(({ dataKey, stringValue }) => {
          return (
            <Column key={dataKey}>
              <Label>{dataKey}</Label>
              <Text>{stringValue}</Text>
            </Column>
          );
        })}
      </Grid>
    </LoadingPanel>
  );
}
