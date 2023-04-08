import { Button, Icon } from 'react-basics';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';
import styles from './HamburgerButton.module.css';

export default function HamburgerButton() {
  const { formatMessage, labels } = useMessages();
  const [active, setActive] = useState(false);

  const menuItems = [
    {
      label: formatMessage(labels.dashboard),
      value: '/dashboard',
    },
    { label: formatMessage(labels.realtime), value: '/realtime' },
    {
      label: formatMessage(labels.settings),
      value: '/settings',
    },
    {
      label: formatMessage(labels.profile),
      value: '/settings/profile',
    },
    { label: formatMessage(labels.logout), value: '/logout' },
  ];

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
