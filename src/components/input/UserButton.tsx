import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
  Row,
  SidebarMenuButton,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useTheme,
} from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useConfig, useLoginQuery, useMessages, useMobile } from '@/components/hooks';
import {
  BookText,
  ExternalLink,
  Globe,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Moon,
  Sun,
  SunMoon,
  UserCircle,
} from '@/components/icons';
import { LanguageMenu } from '@/components/input/LanguageMenu';
import { DOCS_URL } from '@/lib/constants';

export interface UserButtonProps {
  showText?: boolean;
  onClose?: () => void;
}

export function UserButton({ showText = true, onClose }: UserButtonProps) {
  const { user } = useLoginQuery();
  const { cloudMode } = useConfig();
  const { t, labels } = useMessages();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useMobile();
  const router = useRouter();

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const handleNavigate = (url: string, target?: string) => {
    onClose?.();

    if (target) {
      window.open(url, target);
    } else if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const handleSelectTheme = (key: 'light' | 'dark') => {
    setTheme(key);
    onClose?.();
  };

  const items = [
    cloudMode && {
      id: 'docs',
      label: t(labels.documentation),
      path: DOCS_URL,
      icon: <BookText />,
      target: '_blank',
      external: true,
    },
    cloudMode && {
      id: 'support',
      label: t(labels.support),
      path: getUrl('/settings/support'),
      icon: <LifeBuoy />,
    },
    !cloudMode &&
      user.isAdmin && {
        id: 'admin',
        label: t(labels.admin),
        path: '/admin',
        icon: <LockKeyhole />,
      },
    {
      id: 'separator',
      separator: true,
    },
    {
      id: 'logout',
      label: t(labels.logout),
      path: getUrl('/logout'),
      icon: <LogOut />,
    },
  ].filter(Boolean);

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            data-test="button-profile"
            aria-label={showText ? undefined : user.username}
          >
            <UserCircle />
            {showText && <span>{user.username}</span>}
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent side="top" align="start" style={{ width: 'auto', minWidth: 200 }}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Row alignItems="center" gap>
              <Icon>
                <Globe />
              </Icon>
              <Text>{t(labels.language)}</Text>
            </Row>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'start' : 'end'}
          >
            <LanguageMenu onSelect={() => onClose?.()} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Row alignItems="center" gap>
              <Icon>
                <SunMoon />
              </Icon>
              <Text>{t(labels.theme)}</Text>
            </Row>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'start' : 'end'}
          >
            <DropdownMenuRadioGroup value={theme}>
              <DropdownMenuRadioItem
                value="light"
                closeOnClick
                onClick={() => handleSelectTheme('light')}
              >
                <Icon>
                  <Sun />
                </Icon>
                <Text weight={theme === 'light' ? 'bold' : undefined}>Light</Text>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="dark"
                closeOnClick
                onClick={() => handleSelectTheme('dark')}
              >
                <Icon>
                  <Moon />
                </Icon>
                <Text weight={theme === 'dark' ? 'bold' : undefined}>Dark</Text>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {items.map(({ id, path, label, icon, separator, target, external }: any) => {
          if (separator) {
            return <DropdownMenuSeparator key={id} />;
          }

          return (
            <DropdownMenuItem key={id} onClick={() => handleNavigate(path, target)}>
              <Row alignItems="center" gap>
                <Icon>{icon}</Icon>
                <Text>{label}</Text>
                {external && (
                  <Icon color="muted-foreground" size="sm">
                    <ExternalLink />
                  </Icon>
                )}
              </Row>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (showText) {
    return <div style={{ width: '100%' }}>{menu}</div>;
  }

  return (
    <Tooltip>
      <TooltipTrigger delay={0} render={<div style={{ width: '100%' }} />}>
        {menu}
      </TooltipTrigger>
      <TooltipContent side="right">{user.username}</TooltipContent>
    </Tooltip>
  );
}
