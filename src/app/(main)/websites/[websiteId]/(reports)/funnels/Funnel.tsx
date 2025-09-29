import { Grid, Column, Row, Text, Icon, ProgressBar, Dialog, Box } from '@umami/react-zen';
import { useMessages, useResultQuery } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { File, User } from '@/components/icons';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { FunnelEditForm } from './FunnelEditForm';

type FunnelResult = {
  type: string;
  value: string;
  visitors: number;
  previous: number;
  dropped: number;
  dropoff: number;
  remaining: number;
};

export function Funnel({ id, name, type, parameters, websiteId }) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery(type, {
    websiteId,
    ...parameters,
  });

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
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
                  <Dialog
                    title={formatMessage(labels.funnel)}
                    variant="modal"
                    style={{ minHeight: 300, minWidth: 400 }}
                  >
                    <FunnelEditForm id={id} websiteId={websiteId} onClose={close} />
                  </Dialog>
                );
              }}
            </ReportEditButton>
          </Column>
        </Grid>
        {data?.map(
          (
            { type, value, visitors, previous, dropped, dropoff, remaining }: FunnelResult,
            index: number,
          ) => {
            const isPage = type === 'path';
            return (
              <Grid key={index} columns="auto 1fr" gap="6">
                <Column alignItems="center" position="relative">
                  <Row
                    borderRadius="full"
                    backgroundColor="3"
                    width="40px"
                    height="40px"
                    justifyContent="center"
                    alignItems="center"
                    style={{ zIndex: 1 }}
                  >
                    <Text weight="bold" size="3">
                      {index + 1}
                    </Text>
                  </Row>
                  {index > 0 && (
                    <Box
                      position="absolute"
                      backgroundColor="3"
                      width="2px"
                      height="120px"
                      top="-100%"
                    />
                  )}
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
                      <Icon>{type === 'path' ? <File /> : <Lightning />}</Icon>
                      <Text>{value}</Text>
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
                        {`${formatLongNumber(visitors)} ${formatMessage(labels.visitors)}`}
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
                      <Text weight="bold" size="7">
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
