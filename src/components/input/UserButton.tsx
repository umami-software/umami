import {
  Column,
  Icon,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Pressable,
  Row,
  SubmenuTrigger,
  Text,
  Tooltip,
  TooltipTrigger,
  useTheme,
} from '@umami/react-zen';
import { useConfig, useLocale, useLoginQuery, useMessages, useMobile } from '@/components/hooks';
import {
  BookText,
  ExternalLink,
  Globe,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMoon,
  UserCircle,
} from '@/components/icons';
import { DOCS_URL } from '@/lib/constants';
import { languages } from '@/lib/lang';

export interface UserButtonProps {
  showText?: boolean;
}

export function UserButton({ showText = true }: UserButtonProps) {
  const { user } = useLoginQuery();
  const { cloudMode } = useConfig();
  const { t, labels } = useMessages();
  const { locale, saveLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useMobile();

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const languageItems = Object.keys(languages).map(key => ({
    value: key,
    label: languages[key].label,
  }));

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

  return (
    <MenuTrigger>
      <TooltipTrigger isDisabled={showText} delay={0}>
        <Pressable>
          <Row
            alignItems="center"
            flexGrow={1}
            hover={{ backgroundColor: 'surface-sunken' }}
            borderRadius
            minHeight="40px"
            role="button"
            style={{ cursor: 'pointer', textWrap: 'nowrap', overflow: 'hidden', outline: 'none' }}
          >
            <Row alignItems="center" gap padding>
              <Icon>
                <UserCircle />
              </Icon>
              {showText && <Text>{user.username}</Text>}
            </Row>
          </Row>
        </Pressable>
        <Tooltip placement="right">{user.username}</Tooltip>
      </TooltipTrigger>
      <Popover placement="top start">
        <Column minWidth="200px">
          <Menu autoFocus="last">
            <MenuItem id="settings" href={getUrl('/settings')}>
              <Row alignItems="center" gap>
                <Icon>
                  <Settings />
                </Icon>
                <Text>{t(labels.settings)}</Text>
              </Row>
            </MenuItem>
            <SubmenuTrigger>
              <MenuItem id="language" showSubMenuIcon>
                <Row alignItems="center" gap>
                  <Icon>
                    <Globe />
                  </Icon>
                  <Text>{t(labels.language)}</Text>
                </Row>
              </MenuItem>
              <Popover placement={isMobile ? 'bottom start' : 'right bottom'} isNonModal>
                <Menu
                  selectionMode="single"
                  selectedKeys={new Set([locale])}
                  onAction={key => saveLocale(key as string)}
                  style={{ maxHeight: 300, overflow: 'auto' }}
                >
                  {languageItems.map(({ value, label }) => (
                    <MenuItem key={value} id={value}>
                      <Text weight={value === locale ? 'bold' : undefined}>{label}</Text>
                    </MenuItem>
                  ))}
                </Menu>
              </Popover>
            </SubmenuTrigger>
            <SubmenuTrigger>
              <MenuItem id="theme" showSubMenuIcon>
                <Row alignItems="center" gap>
                  <Icon>
                    <SunMoon />
                  </Icon>
                  <Text>{t(labels.theme)}</Text>
                </Row>
              </MenuItem>
              <Popover placement={isMobile ? 'bottom start' : 'right bottom'} isNonModal>
                <Menu
                  selectionMode="single"
                  selectedKeys={new Set([theme])}
                  onAction={key => setTheme(key as 'light' | 'dark')}
                >
                  <MenuItem id="light">
                    <Row alignItems="center" gap>
                      <Icon>
                        <Sun />
                      </Icon>
                      <Text>Light</Text>
                    </Row>
                  </MenuItem>
                  <MenuItem id="dark">
                    <Row alignItems="center" gap>
                      <Icon>
                        <Moon />
                      </Icon>
                      <Text>Dark</Text>
                    </Row>
                  </MenuItem>
                </Menu>
              </Popover>
            </SubmenuTrigger>
            {items.map(({ id, path, label, icon, separator, target, external }: any) => {
              if (separator) {
                return <MenuSeparator key={id} />;
              }
              return (
                <MenuItem key={id} id={id} href={path} target={target}>
                  <Row alignItems="center" gap>
                    <Icon>{icon}</Icon>
                    <Text>{label}</Text>
                    {external && (
                      <Icon color="muted" size="sm">
                        <ExternalLink />
                      </Icon>
                    )}
                  </Row>
                </MenuItem>
              );
            })}
          </Menu>
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
