import { TooltipPopup, Icon, Text, Flexbox, Button } from 'react-basics';
import Icons from 'components/icons';
import { saveDashboard } from 'store/dashboard';
import { useMessages } from 'components/hooks';

export function DashboardSettingsButton() {
  const { formatMessage, labels } = useMessages();

  const handleToggleCharts = () => {
    saveDashboard(state => ({ showCharts: !state.showCharts }));
  };

  const handleEdit = () => {
    saveDashboard({ editing: true });
  };

  return (
    <Flexbox gap={10}>
      <TooltipPopup label={formatMessage(labels.toggleCharts)} position="bottom">
        <Button onClick={handleToggleCharts}>
          <Icon>
            <Icons.BarChart />
          </Icon>
        </Button>
      </TooltipPopup>
      <Button onClick={handleEdit}>
        <Icon>
          <Icons.Edit />
        </Icon>
        <Text>{formatMessage(labels.edit)}</Text>
      </Button>
    </Flexbox>
  );
}

export default DashboardSettingsButton;
