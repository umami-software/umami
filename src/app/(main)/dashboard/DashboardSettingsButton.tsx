import { Row, TooltipTrigger, Tooltip, Icon, Text, Button } from '@umami/react-zen';
import { BarChart, Edit } from '@/components/icons';
import { saveDashboard } from '@/store/dashboard';
import { useMessages } from '@/components/hooks';

export function DashboardSettingsButton() {
  const { formatMessage, labels } = useMessages();

  const handleToggleCharts = () => {
    saveDashboard(state => ({ showCharts: !state.showCharts }));
  };

  const handleEdit = () => {
    saveDashboard({ editing: true });
  };

  return (
    <Row gap="3">
      <TooltipTrigger>
        <Button onPress={handleToggleCharts}>
          <Icon>
            <BarChart />
          </Icon>
        </Button>
        <Tooltip placement="bottom">{formatMessage(labels.toggleCharts)}</Tooltip>
      </TooltipTrigger>
      <Button onPress={handleEdit}>
        <Icon>
          <Edit />
        </Icon>
        <Text>{formatMessage(labels.edit)}</Text>
      </Button>
    </Row>
  );
}
