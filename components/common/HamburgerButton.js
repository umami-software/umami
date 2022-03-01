import Button from 'components/common/Button';
import XMark from 'assets/xmark.svg';
import Bars from 'assets/bars.svg';
import { useState } from 'react';
import styles from './HamburgerButton.module.css';
import MobileMenu from './MobileMenu';
import { FormattedMessage } from 'react-intl';

const menuItems = [
  {
    label: <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />,
    value: '/dashboard',
  },
  { label: <FormattedMessage id="label.realtime" defaultMessage="Realtime" />, value: '/realtime' },
  { label: <FormattedMessage id="label.settings" defaultMessage="Settings" />, value: '/settings' },
  {
    label: <FormattedMessage id="label.profile" defaultMessage="Profile" />,
    value: '/settings/profile',
  },
  { label: <FormattedMessage id="label.logout" defaultMessage="Logout" />, value: '/logout' },
];

export default function HamburgerButton() {
  const [active, setActive] = useState(false);

  function handleClick() {
    setActive(state => !state);
  }

  function handleClose() {
    setActive(false);
  }

  return (
    <>
      <Button
        className={styles.button}
        icon={active ? <XMark /> : <Bars />}
        onClick={handleClick}
      />
      {active && <MobileMenu items={menuItems} onClose={handleClose} />}
    </>
  );
}
