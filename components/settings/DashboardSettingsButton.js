import React from 'react';
import { FormattedMessage } from 'react-intl';
import MenuButton from 'components/common/MenuButton';
import Gear from 'assets/gear.svg';
import useStore, { setDashboard } from 'store/app';
import Button from 'components/common/Button';
import Check from 'assets/check.svg';
import styles from './DashboardSettingsButton.module.css';

const selector = state => state.dashboard;

export default function DashboardSettingsButton() {
  const settings = useStore(selector);

  const menuOptions = [
    {
      label: <FormattedMessage id="message.toggle-charts" defaultMessage="Toggle charts" />,
      value: 'charts',
    },
    {
      label: <FormattedMessage id="message.change-order" defaultMessage="Change order" />,
      value: 'order',
    },
  ];

  function handleSelect(value) {
    if (value === 'charts') {
      setDashboard({ ...settings, showCharts: !settings.showCharts });
    }
    if (value === 'order') {
      setDashboard({ ...settings, changeOrderMode: !settings.changeOrderMode });
    }
    //setDashboard(value);
  }

  function handleExitChangeOrderMode() {
    setDashboard({ ...settings, changeOrderMode: !settings.changeOrderMode });
  }

  function resetWebsiteOrder() {
    setDashboard({ ...settings, websiteOrdering: {} });
  }

  if (settings.changeOrderMode)
    return (
      <div className={styles.buttonGroup}>
        <Button onClick={resetWebsiteOrder} size="small">
          <FormattedMessage id="label.reset-order" defaultMessage="Reset order" />
        </Button>
        <Button onClick={handleExitChangeOrderMode} size="small" icon={<Check />}>
          <FormattedMessage id="label.done" defaultMessage="Done" />
        </Button>
      </div>
    );

  return <MenuButton icon={<Gear />} options={menuOptions} onSelect={handleSelect} hideLabel />;
}
