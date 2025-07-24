import { Key } from 'react';
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
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useMessages, useLoginQuery } from '@/components/hooks';
import { LogOut, Settings, UserCircle, LockKeyhole } from '@/components/icons';

export function ProfileButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const router = useRouter();
  const cloudMode = !!process.env.cloudMode;

  const handleSelect = (key: Key) => {
    router.push(`/${key}`);
  };

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <UserCircle />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last" onAction={handleSelect}>
          <MenuSection title={user.username}>
            <MenuSeparator />
            <MenuItem id="settings">
              <Icon>
                <Settings />
              </Icon>
              <Text>{formatMessage(labels.settings)}</Text>
            </MenuItem>
            {user.isAdmin && (
              <MenuItem id="admin">
                <Icon>
                  <LockKeyhole />
                </Icon>
                <Text>{formatMessage(labels.admin)}</Text>
              </MenuItem>
            )}
            {!cloudMode && (
              <MenuItem data-test="item-logout" id="logout">
                <Icon>
                  <LogOut />
                </Icon>
                <Text>{formatMessage(labels.logout)}</Text>
              </MenuItem>
            )}
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
