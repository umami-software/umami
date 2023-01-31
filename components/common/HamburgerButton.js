import { Button, Icon } from 'react-basics';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MobileMenu from './MobileMenu';
import Icons from 'components/icons';
import styles from './HamburgerButton.module.css';

const menuItems = [
  {
    label: <FormattedMessage id="label.dashboard" defaultMessage="Dashboard" />,
    value: '/dashboard',
  },
  { label: <FormattedMessage id="label.realtime" defaultMessage="Realtime" />, value: '/realtime' },
  {
    label: <FormattedMessage id="label.settings" defaultMessage="AppLayout" />,
    value: '/buttons',
  },
  {
    label: <FormattedMessage id="label.profile" defaultMessage="Profile" />,
    value: '/buttons/profile',
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
      <Button className={styles.button} onClick={handleClick}>
        <Icon>{active ? <Icons.Close /> : <Icons.Menu />}</Icon>
      </Button>
      {active && <MobileMenu items={menuItems} onClose={handleClose} />}
    </>
  );
}
