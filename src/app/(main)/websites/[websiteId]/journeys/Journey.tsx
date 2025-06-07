import { Grid, Row, Column, Text, Icon, Button, Dialog } from '@umami/react-zen';
import { ReportEditButton } from '@/components/input/ReportEditButton';
import { useMessages, useResultQuery } from '@/components/hooks';
import { Arrow, Eye } from '@/components/icons';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { JourneyEditForm } from './JourneyEditForm';

export interface JourneyProps {
  id: string;
  name: string;
  type: string;
  parameters: {
    steps: string;
    startStep: string;
    endStep: string;
  };
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export type GoalData = { num: number; total: number };

export function Journey({
  id,
  name,
  type,
  parameters,
  websiteId,
  startDate,
  endDate,
}: JourneyProps) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading } = useResultQuery<GoalData>(type, {
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
                  <Dialog
                    title={formatMessage(labels.goal)}
                    variant="modal"
                    style={{ minHeight: 375, minWidth: 400 }}
                  >
                    <JourneyEditForm id={id} websiteId={websiteId} onClose={close} />
                  </Dialog>
                );
              }}
            </ReportEditButton>
          </Column>
        </Grid>
        <Row alignItems="center" gap>
          <Text>
            {formatMessage(labels.steps)}: {parameters?.steps}
          </Text>
        </Row>
        <Row alignItems="center" justifyContent="space-between">
          <Row alignItems="center" gap="6">
            <Text>
              {formatMessage(labels.startStep)}: {parameters?.startStep}
            </Text>
            <Icon>
              <Arrow />
            </Icon>
            <Text>
              {formatMessage(labels.endStep)}: {parameters?.endStep || formatMessage(labels.none)}
            </Text>
          </Row>
          <Button>
            <Row alignItems="center" gap>
              <Icon>
                <Eye />
              </Icon>
              <Text>View</Text>
            </Row>
          </Button>
        </Row>
      </Grid>
    </LoadingPanel>
  );
}
