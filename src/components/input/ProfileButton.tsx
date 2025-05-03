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
import { User, LogOut, CircleUserRound } from 'lucide-react';
import { useMessages, useLoginQuery } from '@/components/hooks';

export function ProfileButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const router = useRouter();
  const cloudMode = !!process.env.cloudMode;

  const handleSelect = (key: Key) => {
    if (key === 'profile') {
      router.push('/settings/profile');
    }
    if (key === 'logout') {
      router.push('/logout');
    }
  };

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet">
        <Icon>
          <CircleUserRound />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last" onAction={handleSelect}>
          <MenuSection title={user.username}>
            <MenuSeparator />
            <MenuItem id="profile">
              <Icon>
                <User />
              </Icon>
              <Text>{formatMessage(labels.profile)}</Text>
            </MenuItem>
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
