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
} from '@umami/react-zen';
import { useMessages, useLoginQuery, useNavigation, useConfig } from '@/components/hooks';
import { LogOut, LockKeyhole, Settings, UserCircle } from '@/components/icons';

export function SettingsButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { router, renderUrl } = useNavigation();
  const { cloudMode } = useConfig();

  const handleAction = (id: Key) => {
    if (id === 'settings') {
      if (cloudMode) {
        window.location.href = `/settings`;
        return;
      }
    }

    router.push(renderUrl(`/${id}`));
  };

  return (
    <MenuTrigger>
      <Button data-test="button-profile" variant="quiet" autoFocus={false}>
        <Icon>
          <UserCircle />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Menu autoFocus="last" onAction={handleAction}>
          <MenuSection title={user.username}>
            <MenuSeparator />
            <MenuItem id="settings" icon={<Settings />} label={formatMessage(labels.settings)} />
            {!cloudMode && user.isAdmin && (
              <MenuItem id="admin" icon={<LockKeyhole />} label={formatMessage(labels.admin)} />
            )}
            <MenuSeparator />
            <MenuItem id="logout" icon={<LogOut />} label={formatMessage(labels.logout)} />
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
