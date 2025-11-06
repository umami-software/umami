import { Fragment } from 'react';
import {
  Icon,
  Button,
  MenuTrigger,
  Popover,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuSection,
  Text,
  Row,
} from '@umami/react-zen';
import { useMessages, useLoginQuery, useNavigation } from '@/components/hooks';
import { LogOut, UserCircle, LockKeyhole } from '@/components/icons';

export function ProfileButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { renderUrl } = useNavigation();

  const items = [
    {
      id: 'settings',
      label: formatMessage(labels.profile),
      path: renderUrl('/settings/profile'),
      icon: <UserCircle />,
    },
    user.isAdmin &&
      !process.env.cloudMode && {
        id: 'admin',
        label: formatMessage(labels.admin),
        path: '/admin',
        icon: <LockKeyhole />,
      },
    {
      id: 'logout',
      label: formatMessage(labels.logout),
      path: '/logout',
      icon: <LogOut />,
      separator: true,
    },
  ].filter(n => n);

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <UserCircle />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last">
          <MenuSection title={user.username}>
            <MenuSeparator />
            {items.map(({ id, path, label, icon, separator }) => {
              return (
                <Fragment key={id}>
                  {separator && <MenuSeparator />}
                  <MenuItem id={id} href={path}>
                    <Row alignItems="center" gap>
                      <Icon>{icon}</Icon>
                      <Text>{label}</Text>
                    </Row>
                  </MenuItem>
                </Fragment>
              );
            })}
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
