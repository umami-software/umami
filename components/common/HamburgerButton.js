import { Button, Icon } from 'react-basics';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export function HamburgerButton() {
  const { formatMessage, labels } = useMessages();
  const [active, setActive] = useState(false);
  const { cloudMode } = useConfig();

  const menuItems = [
    {
      label: formatMessage(labels.dashboard),
      url: '/dashboard',
    },
    { label: formatMessage(labels.realtime), url: '/realtime' },
    !cloudMode && {
      label: formatMessage(labels.settings),
      url: '/settings',
      children: [
        {
          label: formatMessage(labels.websites),
          url: '/settings/websites',
        },
        {
          label: formatMessage(labels.teams),
          url: '/settings/teams',
        },
        {
          label: formatMessage(labels.users),
          url: '/settings/users',
        },
        {
          label: formatMessage(labels.profile),
          url: '/settings/profile',
        },
      ],
    },
    cloudMode && {
      label: formatMessage(labels.profile),
      url: '/settings/profile',
    },
    !cloudMode && { label: formatMessage(labels.logout), url: '/logout' },
  ].filter(n => n);

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
