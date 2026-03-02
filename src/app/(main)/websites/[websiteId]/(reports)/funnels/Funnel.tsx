import { Box, Column, Dialog, Grid, Icon, ProgressBar, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useNavigation, useResultQuery } from '@/components/hooks';
import { File, User } from '@/components/icons';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { ChangeLabel } from '@/components/metrics/ChangeLabel';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
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
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
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
              <Text size="lg" weight="bold">
                {name}
              </Text>
            </Row>
          </Column>
          {!isSharePage && (
            <Column>
              <ReportEditButton id={id} name={name} type={type}>
                {({ close }) => {
                  return (
                    <Dialog title={t(labels.funnel)} style={{ minHeight: 300, minWidth: 400 }}>
                      <FunnelEditForm id={id} websiteId={websiteId} onClose={close} />
                    </Dialog>
                  );
                }}
              </ReportEditButton>
            </Column>
          )}
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
