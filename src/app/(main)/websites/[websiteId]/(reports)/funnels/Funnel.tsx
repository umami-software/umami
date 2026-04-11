import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useNavigation, useOperatorLabels, useResultQuery } from '@/components/hooks';
import { File, User } from '@/components/icons';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import type { FunnelResult } from '@/queries/sql/reports/getFunnel';
import { Box, Column, Grid, Icon, ProgressBar, Row, Text } from '@umami/react-zen';
import { FunnelEditForm } from './FunnelEditForm';

interface FunnelProps {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  websiteId: string;
}

export function Funnel({ id, name, type, parameters, websiteId }: FunnelProps) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const { data, error, isLoading } = useResultQuery<Array<FunnelResult>>(type, {
    websiteId,
    ...parameters,
  });

  const operatorLabels = useOperatorLabels();

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <Grid gap>
        <Grid columns="1fr auto" gap>
          <Column gap>
            <Row>
              <Text size="lg" weight="bold">
                {name}
              </Text>
            </Row>
          </Column>
          {!isSharePage && (
            <Column>
              <ReportEditButton
                id={id}
                name={name}
                type={type}
                title={t(labels.funnel)}
                width="700px"
                height="600px"
              >
                {({ close }) => <FunnelEditForm id={id} websiteId={websiteId} onClose={close} />}
              </ReportEditButton>
            </Column>
          )}
        </Grid>
        {data?.map(
          (
            { type, value, filters, visitors, previous, dropped, dropoff, remaining }: FunnelResult,
            index: number,
          ) => {
            const isPage = type === 'path';
            return (
              <Grid key={index} columns="auto 1fr" gap="6">
                <Column alignItems="center" position="relative">
                  <Row
                    borderRadius="full"
                    backgroundColor="surface-sunken"
                    width="40px"
                    height="40px"
                    justifyContent="center"
                    alignItems="center"
                    style={{ zIndex: 1 }}
                  >
                    <Text weight="bold" size="base">
                      {index + 1}
                    </Text>
                  </Row>
                  {index > 0 && (
                    <Box
                      position="absolute"
                      backgroundColor="surface-sunken"
                      width="2px"
                      height="120px"
                      top="-100%"
                    />
                  )}
                </Column>
                <Column gap>
                  <Row alignItems="center" justifyContent="space-between" gap>
                    <Text color="muted">
                      {t(isPage ? labels.viewedPage : labels.triggeredEvent)}
                    </Text>
                    <Text color="muted">{t(labels.conversionRate)}</Text>
                  </Row>
                  <Row alignItems="center" justifyContent="space-between" gap>
                    <Column gap="1">
                      <Row alignItems="center" gap>
                        <Icon>{type === 'path' ? <File /> : <Lightning />}</Icon>
                        <Text>{value}</Text>
                      </Row>
                      {filters?.map((f, i) => (
                        <Row key={i} gap="1" style={{ paddingLeft: 28 }}>
                          <Text color="muted">{f.property}</Text>
                          <Text color="muted" transform="lowercase">
                            {operatorLabels[f.operator] ?? f.operator}
                          </Text>
                          <Text color="muted">{f.value}</Text>
                        </Row>
                      ))}
                    </Column>
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
                  </Row>
                  <Row alignItems="center" gap="6">
                    <ProgressBar
                      value={visitors || 0}
                      minValue={0}
                      maxValue={previous || 1}
                      style={{ width: '100%' }}
                    />
                    <Row minWidth="90px" justifyContent="end">
                      <Text weight="bold" size="4xl">
                        {Math.round(remaining * 100)}%
                      </Text>
                    </Row>
                  </Row>
                </Column>
              </Grid>
            );
          },
        )}
      </Grid>
    </LoadingPanel>
  );
}
