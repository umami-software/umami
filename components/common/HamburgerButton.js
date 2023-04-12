import { Button, Icon } from 'react-basics';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';
import useConfig from 'hooks/useConfig';

export default function HamburgerButton() {
  const { formatMessage, labels } = useMessages();
  const [active, setActive] = useState(false);
  const { cloudMode } = useConfig();

  const menuItems = [
    {
      label: formatMessage(labels.dashboard),
      value: '/dashboard',
    },
    { label: formatMessage(labels.realtime), value: '/realtime' },
    !cloudMode && {
      label: formatMessage(labels.settings),
      value: '/settings',
      children: [
        {
          label: formatMessage(labels.websites),
          value: '/settings/websites',
        },
        {
          label: formatMessage(labels.teams),
          value: '/settings/teams',
        },
        {
          label: formatMessage(labels.users),
          value: '/settings/users',
        },
      ],
    },
    {
      label: formatMessage(labels.profile),
      value: '/settings/profile',
    },
    !cloudMode && { label: formatMessage(labels.logout), value: '/logout' },
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
