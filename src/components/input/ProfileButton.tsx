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
import { Icons } from '@/components/icons';
import { useMessages, useLogin } from '@/components/hooks';

export function ProfileButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const router = useRouter();
  const cloudMode = !!process.env.cloudMode;

  const handleSelect = (key: Key) => {
    if (key === 'profile') {
      router.push('/profile');
    }
    if (key === 'logout') {
      router.push('/logout');
    }
  };

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <Icons.Profile />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last" onAction={handleSelect}>
          <MenuSection title={user.username}>
            <MenuSeparator />
            <MenuItem id="profile">
              <Icon>
                <Icons.User />
              </Icon>
              <Text>{formatMessage(labels.profile)}</Text>
            </MenuItem>
            {!cloudMode && (
              <MenuItem data-test="item-logout" id="logout">
                <Icon>
                  <Icons.Logout />
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
