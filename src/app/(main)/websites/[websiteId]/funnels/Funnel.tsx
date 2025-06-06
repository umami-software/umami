import { Grid, Column, Row, Text, Icon, ProgressBar, Dialog } from '@umami/react-zen';
import { useMessages, useResultQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { File, Lightning, User } from '@/components/icons';
import { formatLongNumber } from '@/lib/format';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { FunnelEditForm } from './FunnelEditForm';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';

type FunnelResult = {
  type: string;
  value: string;
  visitors: number;
  previous: number;
  dropped: number;
  droppoff: number;
  remaining: number;
};

export function Funnel({ id, name, type, parameters, websiteId, startDate, endDate }) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<any>(type, {
    websiteId,
    dateRange: {
      startDate,
      endDate,
    },
    parameters,
  });

  return (
    <LoadingPanel isEmpty={!data} isLoading={isLoading} error={error}>
      <Grid gap>
        <Grid columns="1fr auto" gap>
          <Column gap>
            <Row>
              <Text size="4" weight="bold">
                {name}
              </Text>
            </Row>
          </Column>
          <Column>
            <ReportEditButton id={id} name={name} type={type}>
              {({ close }) => {
                return (
                  <Dialog title={formatMessage(labels.funnel)} variant="modal">
                    <FunnelEditForm id={id} websiteId={websiteId} onClose={close} />
                  </Dialog>
                );
              }}
            </ReportEditButton>
          </Column>
        </Grid>
        {data?.map(
          (
            { type, value, visitors, previous, dropped, remaining }: FunnelResult,
            index: number,
          ) => {
            const isPage = type === 'page';
            return (
              <Grid key={index} columns="auto 1fr" gap="6">
                <Column>
                  <Row
                    borderRadius="full"
                    backgroundColor="2"
                    width="40px"
                    height="40px"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text weight="bold" size="4">
                      {index + 1}
                    </Text>
                  </Row>
                </Column>
                <Column gap>
                  <Row alignItems="center" justifyContent="space-between" gap>
                    <Text color="muted">
                      {formatMessage(isPage ? labels.viewedPage : labels.triggeredEvent)}
                    </Text>
                    <Text color="muted">{formatMessage(labels.conversionRate)}</Text>
                  </Row>
                  <Row alignItems="center" justifyContent="space-between" gap>
                    <Row alignItems="center" gap>
                      <Icon>{type === 'page' ? <File /> : <Lightning />}</Icon>
                      <Text>{value}</Text>
                    </Row>
                    <Row alignItems="center" gap>
                      {index > 0 && (
                        <ChangeLabel value={-dropped}>{formatLongNumber(dropped)}</ChangeLabel>
                      )}
                      <Icon>
                        <User />
                      </Icon>
                      <Text title={visitors.toString()}>{formatLongNumber(visitors)}</Text>
                    </Row>
                  </Row>
                  <Row alignItems="center" gap="6">
                    <ProgressBar
                      value={visitors || 0}
                      minValue={0}
                      maxValue={previous || 1}
                      style={{ width: '100%' }}
                    />
                    <Text weight="bold" size="7">
                      {Math.round(remaining * 100)}%
                    </Text>
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
