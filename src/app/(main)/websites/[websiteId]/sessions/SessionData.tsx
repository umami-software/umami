import { Column, Label, Row, Text } from '@umami/react-zen';
import { Badge } from '@/components/common/Badge';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useSessionDataQuery } from '@/components/hooks';
import { DATA_TYPES } from '@/lib/constants';
import { getDisplayValue } from '@/lib/data';

export function SessionData({ websiteId, sessionId }: { websiteId: string; sessionId: string }) {
  const { data, isLoading, error } = useSessionDataQuery(websiteId, sessionId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {!data?.length && <Empty />}
      <Column gap="6">
        {data?.map(row => {
          return (
            <Column key={row.dataKey}>
              <Label>{row.dataKey}</Label>
              <Row alignItems="center" gap>
                <Text>{getDisplayValue(row)}</Text>
                <Badge variant="gray" dot={false}>
                  {DATA_TYPES[row.dataType]}
                </Badge>
              </Row>
            </Column>
          );
        })}
      </Column>
    </LoadingPanel>
  );
}
