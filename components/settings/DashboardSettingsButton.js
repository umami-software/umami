import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MenuButton from 'components/common/MenuButton';
import Gear from 'assets/gear.svg';
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

  return <MenuButton icon={<Gear />} options={menuOptions} onSelect={handleSelect} hideLabel />;
}
