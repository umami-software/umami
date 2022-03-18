import React from 'react';
import { FormattedMessage } from 'react-intl';
import MenuButton from 'components/common/MenuButton';
import Gear from 'assets/gear.svg';
import useStore, { setDashboard, defaultDashboardConfig } from 'store/app';

const selector = state => state.dashboard;

export default function DashboardSettingsButton() {
  const settings = useStore(selector);

  const menuOptions = [
    {
      label: <FormattedMessage id="message.toggle-charts" defaultMessage="Toggle charts" />,
      value: 'charts',
    },
  ];

  function handleSelect(value) {
    if (value === 'charts') {
      setDashboard({ ...defaultDashboardConfig, showCharts: !settings.showCharts });
    }
    //setDashboard(value);
  }

  return <MenuButton icon={<Gear />} options={menuOptions} onSelect={handleSelect} hideLabel />;
}
