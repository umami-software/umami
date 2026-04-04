import { Box, Column, Label, Row, Text } from '@umami/react-zen';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useSessionDataQuery } from '@/components/hooks';
import { DATA_TYPES } from '@/lib/constants';

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
                <Box paddingY="1" paddingX="2" border borderRadius borderColor="muted">
                  <Text color="muted" size="xs">
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
