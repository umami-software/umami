import { Column, Dialog, Grid, Icon, ProgressBar, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useNavigation, useResultQuery } from '@/components/hooks';
import { File, User } from '@/components/icons';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import { GoalEditForm } from './GoalEditForm';

export interface GoalProps {
  id: string;
  name: string;
  type: string;
  parameters: {
    name: string;
    type: string;
    value: string;
  };
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export type GoalData = { num: number; total: number };

export function Goal({ id, name, type, parameters, websiteId, startDate, endDate }: GoalProps) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  const { data, error, isLoading, isFetching } = useResultQuery<GoalData>(type, {
    websiteId,
    startDate,
    endDate,
    ...parameters,
  });
  const isPage = parameters?.type === 'path';

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
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
                      <Dialog
                        title={t(labels.goal)}
                        variant="modal"
                        style={{ minHeight: 300, minWidth: 400 }}
                      >
                        <GoalEditForm id={id} websiteId={websiteId} onClose={close} />
                      </Dialog>
                    );
                  }}
                </ReportEditButton>
              </Column>
            )}
          </Grid>
          <Row alignItems="center" justifyContent="space-between" gap>
            <Text color="muted">{t(isPage ? labels.viewedPage : labels.triggeredEvent)}</Text>
            <Text color="muted">{t(labels.conversionRate)}</Text>
          </Row>
          <Row alignItems="center" justifyContent="space-between" gap>
            <Row alignItems="center" gap>
              <Icon>{parameters.type === 'path' ? <File /> : <Lightning />}</Icon>
              <Text>{parameters.value}</Text>
            </Row>
            <Row alignItems="center" gap>
              <Icon>
                <User />
              </Icon>
              <Text title={`${data?.num} / ${data?.total}`}>{`${formatLongNumber(
                data?.num,
              )} / ${formatLongNumber(data?.total)}`}</Text>
            </Row>
          </Row>
          <Row alignItems="center" gap="6">
            <ProgressBar
              value={data?.num || 0}
              minValue={0}
              maxValue={data?.total || 1}
              style={{ width: '100%' }}
            />
            <Text weight="bold" size="4xl">
              {data?.total ? Math.round((+data?.num / +data?.total) * 100) : '0'}%
            </Text>
          </Row>
        </Grid>
      )}
    </LoadingPanel>
  );
}
