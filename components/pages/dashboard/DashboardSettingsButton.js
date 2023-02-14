import { defineMessages, useIntl } from 'react-intl';
import { Menu, Icon, Text, PopupTrigger, Popup, Item, Button } from 'react-basics';
import Icons from 'components/icons';
import { labels } from 'components/messages';
import { saveDashboard } from 'store/dashboard';

const messages = defineMessages({
  toggleCharts: { id: 'message.toggle-charts', defaultMessage: 'Toggle charts' },
  editDashboard: { id: 'message.edit-dashboard', defaultMessage: 'Edit dashboard' },
});

export default function DashboardSettingsButton() {
  const { formatMessage } = useIntl();

  const menuOptions = [
    {
      label: formatMessage(messages.toggleCharts),
      value: 'charts',
    },
    {
      label: formatMessage(messages.editDashboard),
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
