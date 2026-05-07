import {
  Button,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Row,
  Text,
} from '@umami/react-zen';
import { Fragment } from 'react';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { LockKeyhole, LogOut, UserCircle } from '@/components/icons';

export function ProfileButton() {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const { renderUrl } = useNavigation();

  const items = [
    {
      id: 'settings',
      label: t(labels.profile),
      path: renderUrl('/settings/profile'),
      icon: <UserCircle />,
    },
    user.isAdmin &&
      !process.env.cloudMode && {
        id: 'admin',
        label: t(labels.admin),
        path: '/admin',
        icon: <LockKeyhole />,
      },
    {
      id: 'logout',
      label: t(labels.logout),
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
