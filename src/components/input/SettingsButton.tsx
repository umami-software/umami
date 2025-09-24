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
import {
  LogOut,
  LockKeyhole,
  Settings,
  UserCircle,
  LifeBuoy,
  BookText,
  ExternalLink,
} from '@/components/icons';
import { DOCS_URL } from '@/lib/constants';

export function SettingsButton() {
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { router } = useNavigation();
  const { cloudMode } = useConfig();

  const handleAction = (id: Key) => {
    const url = id.toString();

    if (cloudMode) {
      if (url === '/docs') {
        window.open(DOCS_URL, '_blank');
      } else {
        window.location.href = url;
      }
    } else {
      router.push(url);
    }
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
            <MenuItem id="/settings" icon={<Settings />} label={formatMessage(labels.settings)} />
            {!cloudMode && user.isAdmin && (
              <MenuItem id="/admin" icon={<LockKeyhole />} label={formatMessage(labels.admin)} />
            )}
            {cloudMode && (
              <>
                <MenuItem
                  id="/docs"
                  icon={<BookText />}
                  label={formatMessage(labels.documentation)}
                >
                  <Icon color="muted">
                    <ExternalLink />
                  </Icon>
                </MenuItem>
                <MenuItem
                  id="/settings/support"
                  icon={<LifeBuoy />}
                  label={formatMessage(labels.support)}
                />
              </>
            )}
            <MenuSeparator />
            <MenuItem id="/logout" icon={<LogOut />} label={formatMessage(labels.logout)} />
          </MenuSection>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
