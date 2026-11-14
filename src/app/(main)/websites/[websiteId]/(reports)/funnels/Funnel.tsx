import { Box, Grid, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useFunnelQuery, useMessages, useNavigation } from '@/components/hooks';
import { formatLongNumber } from '@/lib/format';
import type { FunnelResult } from '@/queries/sql/funnels/getFunnel';
import { FunnelEditForm } from './FunnelEditForm';

interface FunnelProps {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  websiteId: string;
  allowEdit?: boolean;
}

export function Funnel({ id, name, type, parameters, websiteId, allowEdit = true }: FunnelProps) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const { data, error, isLoading } = useFunnelQuery({
    websiteId,
    id,
    ...parameters,
  });

  return (
    <Grid gap>
      <Grid columns="1fr auto" gap>
        <Column gap>
          <Row>
            <Text size="lg" weight="bold">
              {name}
            </Text>
          </Row>
        </Column>
        {allowEdit && !isSharePage && (
          <Column>
            <SavedDefinitionEditButton
              websiteId={websiteId}
              id={id}
              name={name}
              type={type}
              title={t(labels.funnel)}
              width="700px"
              height="600px"
            >
              {({ close }) => <FunnelEditForm id={id} websiteId={websiteId} onClose={close} />}
            </SavedDefinitionEditButton>
          </Column>
        )}
      </Grid>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data?.map(
          (
            { type, value, filters, visitors, previous, dropped, dropoff, remaining }: FunnelResult,
            index: number,
          ) => {
            const isPage = type === 'path';
            return (
              <Row
                key={index}
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid var(--border-color)"
                paddingBottom={index < data?.length - 1 ? 12 : 0}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Column alignItems="center" width="120px">
                  <Row gap={2}>
                    <Text weight="bold" size="base">
                      {index + 1}
                    </Text>
                    <Text color="muted" size="sm">
                      {isPage ? labels.viewedPage : labels.triggeredEvent}
                    </Text>
                  </Row>
                  <Row gap={1}>
                    <Text color="muted">{value}</Text>
                  </Row>
                  {filters?.map((f, i) => (
                    <Row key={i} gap="1" style={{ paddingLeft: 28, marginTop: 2 }}>
                      <Text color="muted">{f.property}</Text>
                      <Text color="muted" transform="lowercase">
                        {operatorLabels[f.operator] ?? f.operator}
                      </Text>
                      <Text color="muted">{f.value}</Text>
                    </Row>
                  ))}
                </Column>
                <Column gap>
                  <Row alignItems="center" justifyContent="flex-end" gap>
                    <Text weight="bold" size="xl">
                      {Math.round(remaining * 100)}%
                    </Text>
                    <Text color="muted" size="sm">
                      {t(labels.remaining)}
                    </Text>
                  </Row>
                  <Row alignItems="center" gap>
                    {index > 0 && (
                      <ChangeLabel value={-dropped} title={`${-Math.round(dropoff * 100)}%`}>
                        {formatLongNumber(dropped)}
                      </ChangeLabel>
                    )}
                    <Icon>
                      <User />
                    </Icon>
                    <Text title={visitors.toString()} transform="lowercase">
                      {`${formatLongNumber(visitors)} ${t(labels.visitors)}`}
                    </Text>
                  </Row>
                  <ProgressBar
                    value={visitors || 0}
                    min={0}
                    max={previous || 1}
                    style={{ width: '100%' }}
                  />
                </Column>
              </Row>
            );
          },
        )}
      </LoadingPanel>
    </Grid>
  );
}
