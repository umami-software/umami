import { Button, Icon } from '@umami/react-zen';
import { useState } from 'react';
import { Close, Menu } from '@/components/icons';
import { MobileMenu } from './MobileMenu';

export function HamburgerButton({ menuItems }: { menuItems: any[] }) {
  const [active, setActive] = useState(false);

  const handleClick = () => setActive(state => !state);
  const handleClose = () => setActive(false);

  return (
    <>
      <Button variant="quiet" onClick={handleClick}>
        <Icon>{active ? <Close /> : <Menu />}</Icon>
      </Button>
      {active && <MobileMenu items={menuItems} onClose={handleClose} />}
    </>
  );
}
