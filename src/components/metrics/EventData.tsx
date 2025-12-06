import { Column, Grid, Label, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useEventDataQuery } from '@/components/hooks';

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
