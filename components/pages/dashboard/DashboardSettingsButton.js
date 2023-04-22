import { Menu, Icon, Text, PopupTrigger, Popup, Item, Button } from 'react-basics';
import Icons from 'components/icons';
import { saveDashboard } from 'store/dashboard';
import useMessages from 'hooks/useMessages';

export function DashboardSettingsButton() {
  const { formatMessage, labels } = useMessages();

  const menuOptions = [
    {
      label: formatMessage(labels.toggleCharts),
      value: 'charts',
    },
    {
      label: formatMessage(labels.editDashboard),
      value: 'order',
    },
  ];

  function handleSelect(value) {
    if (value === 'charts') {
      saveDashboard(state => ({ showCharts: !state.showCharts }));
    }
    if (value === 'order') {
      saveDashboard({ editing: true });
    }
  }

  return (
    <PopupTrigger>
      <Button>
        <Icon>
          <Icons.Edit />
        </Icon>
        <Text>{formatMessage(labels.edit)}</Text>
      </Button>
      <Popup alignment="end">
        <Menu variant="popup" items={menuOptions} onSelect={handleSelect}>
          {({ label, value }) => <Item key={value}>{label}</Item>}
        </Menu>
      </Popup>
    </PopupTrigger>
  );
}

export default DashboardSettingsButton;
