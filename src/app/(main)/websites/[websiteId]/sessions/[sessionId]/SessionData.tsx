import { Text, Column, Row, Label, Box } from '@umami/react-zen';
import { useSessionDataQuery } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DATA_TYPES } from '@/lib/constants';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export function SessionData({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { data, isLoading, error } = useSessionDataQuery(websiteId, sessionId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {!data?.length && <Empty />}
      <Column gap="6">
        {data?.map(({ dataKey, dataType, stringValue }) => {
          return (
            <Column key={dataKey}>
              <Label>{dataKey}</Label>
              <Row alignItems="center" gap>
                <Text>{stringValue}</Text>
                <Box paddingY="1" paddingX="2" border borderRadius borderColor="5">
                  <Text color="muted" size="1">
                    {DATA_TYPES[dataType]}
                  </Text>
                </Box>
              </Row>
            </Column>
          );
        })}
      </Column>
    </LoadingPanel>
  );
}
