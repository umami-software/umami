import { Button, Icon } from 'react-basics';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import Icons from 'components/icons';

export function HamburgerButton({ menuItems }) {
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
