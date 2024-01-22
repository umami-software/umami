import { Button, Icon, Icons } from 'react-basics';
import { useState } from 'react';
import MobileMenu from './MobileMenu';

export function HamburgerButton({ menuItems }: { menuItems: any[] }) {
  const [active, setActive] = useState(false);

  const handleClick = () => setActive(state => !state);
  const handleClose = () => setActive(false);

  return (
    <>
      <Button variant="quiet" onClick={handleClick}>
        <Icon>{active ? <Icons.Close /> : <Icons.Menu />}</Icon>
      </Button>
      {active && <MobileMenu items={menuItems} onClose={handleClose} />}
    </>
  );
}

export default HamburgerButton;
