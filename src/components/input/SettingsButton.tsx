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
import type { ReactNode } from 'react';
import { useConfig, useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import {
  BookText,
  ExternalLink,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Settings,
  UserCircle,
} from '@/components/icons';
import { DOCS_URL } from '@/lib/constants';

export function SettingsButton() {
  const { t, labels } = useMessages();
  const { user } = useLoginQuery();
  const { router } = useNavigation();
  const { cloudMode } = useConfig();

  const handleAction = (url: string) => {
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

  const renderItem = (url: string, icon: ReactNode, label: ReactNode, children?: ReactNode) => (
    <DropdownMenuItem onClick={() => handleAction(url)}>
      <Row alignItems="center" gap>
        <Icon>{icon}</Icon>
        <Text>{label}</Text>
        {children}
      </Row>
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button data-test="button-profile" variant="ghost" autoFocus={false} />}
      >
        <Icon>
          <UserCircle />
        </Icon>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {renderItem('/settings', <Settings />, t(labels.settings))}
          {!cloudMode && user.isAdmin && renderItem('/admin', <LockKeyhole />, t(labels.admin))}
          {cloudMode && (
            <>
              {renderItem(
                '/docs',
                <BookText />,
                t(labels.documentation),
                <Icon color="muted-foreground">
                  <ExternalLink />
                </Icon>,
              )}
              {renderItem('/settings/support', <LifeBuoy />, t(labels.support))}
            </>
          )}
          <DropdownMenuSeparator />
          {renderItem('/logout', <LogOut />, t(labels.logout))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
