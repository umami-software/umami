import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Row,
  Text,
} from '@umami/react-zen';
import { Fragment } from 'react';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { LockKeyhole, LogOut, UserCircle } from '@/components/icons';

export function ProfileButton() {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const { renderUrl, router } = useNavigation();

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
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button data-test="button-profile" variant="ghost" />}>
        <Icon>
          <UserCircle />
        </Icon>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map(({ id, path, label, icon, separator }) => {
            return (
              <Fragment key={id}>
                {separator && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => router.push(path)}>
                  <Row alignItems="center" gap>
                    <Icon>{icon}</Icon>
                    <Text>{label}</Text>
                  </Row>
                </DropdownMenuItem>
              </Fragment>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
