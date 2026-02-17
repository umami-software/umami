import { Column, Dialog, Grid, Icon, ProgressBar, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useResultQuery } from '@/components/hooks';
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
  const { formatMessage, labels } = useMessages();
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
                      title={formatMessage(labels.goal)}
                      variant="modal"
                      style={{ minHeight: 300, minWidth: 400 }}
                    >
                      <GoalEditForm id={id} websiteId={websiteId} onClose={close} />
                    </Dialog>
                  );
                }}
              </ReportEditButton>
            </Column>
          </Grid>
          <Row alignItems="center" justifyContent="space-between" gap>
            <Text color="muted">
              {formatMessage(isPage ? labels.viewedPage : labels.triggeredEvent)}
            </Text>
            <Text color="muted">{formatMessage(labels.conversionRate)}</Text>
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
            <Text weight="bold" size="7">
              {data?.total ? Math.round((+data?.num / +data?.total) * 100) : '0'}%
            </Text>
          </Row>
        </Grid>
      )}
    </LoadingPanel>
  );
}
