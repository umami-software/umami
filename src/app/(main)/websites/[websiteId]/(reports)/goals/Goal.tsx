import { Column, Grid, Icon, ProgressBar, Row, Text } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useGoalQuery, useMessages, useMobile, useNavigation } from '@/components/hooks';
import { File, User } from '@/components/icons';
import { SavedDefinitionEditButton } from '@/components/input/SavedDefinitionEditButton';
import { Lightning } from '@/components/svg';
import { formatLongNumber } from '@/lib/format';
import { formatPercent } from '../funnels/format';
import { GoalEditForm } from './GoalEditForm';
import { GoalMaximizeButton } from './GoalExpandedView';

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
  allowEdit?: boolean;
  allowMaximize?: boolean;
}

export type GoalData = { num: number; total: number };

export function Goal({
  id,
  name,
  type,
  parameters,
  websiteId,
  startDate,
  endDate,
  allowEdit = true,
  allowMaximize = true,
}: GoalProps) {
  const { t, labels } = useMessages();
  const { pathname } = useNavigation();
  const isSharePage = pathname.includes('/share/');
  // The expanded view is a desktop analysis layout, so small screens keep the compact goal.
  const { isMobile } = useMobile();
  const { data, error, isLoading, isFetching } = useGoalQuery({
    websiteId,
    id,
    startDate,
    endDate,
    ...parameters,
  });
  const isPage = parameters?.type === 'path';

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
        <Row alignItems="center" gap="1">
          {allowMaximize && !isMobile && data && (
            <GoalMaximizeButton
              websiteId={websiteId}
              id={id}
              name={name}
              type={parameters.type}
              value={parameters.value}
              data={data}
            />
          )}
          {allowEdit && !isSharePage && (
            <SavedDefinitionEditButton
              websiteId={websiteId}
              id={id}
              name={name}
              type={type}
              title={t(labels.goal)}
              minWidth="400px"
              minHeight="300px"
            >
              {({ close }) => <GoalEditForm id={id} websiteId={websiteId} onClose={close} />}
            </SavedDefinitionEditButton>
          )}
        </Row>
      </Grid>
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
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
            min={0}
            max={data?.total || 1}
            style={{ width: '100%' }}
          />
          <Text weight="bold" size="4xl">
            {formatPercent(data?.total ? +data.num / +data.total : 0)}
          </Text>
        </Row>
      </LoadingPanel>
    </Grid>
  );
}
