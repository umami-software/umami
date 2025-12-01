import {
  Text,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuSeparator,
  SubmenuTrigger,
  Popover,
  Row,
  Column,
  Pressable,
  IconLabel,
} from '@umami/react-zen';
import {
  useConfig,
  useLoginQuery,
  useMessages,
  useMobile,
  useNavigation,
} from '@/components/hooks';
import {
  BookText,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  Settings,
  User,
  Users,
} from '@/components/icons';
import { Switch } from '@/components/svg';
import { DOCS_URL } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

export interface TeamsButtonProps {
  showText?: boolean;
  onAction?: (id: any) => void;
}

export function NavButton({ showText = true }: TeamsButtonProps) {
  const { user } = useLoginQuery();
  const { cloudMode } = useConfig();
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();
  const { isMobile } = useMobile();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const handleAction = async () => {};

  return (
    <MenuTrigger>
      <Pressable>
        <Row
          alignItems="center"
          justifyContent="space-between"
          flexGrow={1}
          padding
          border
          borderRadius
          shadow="1"
          maxHeight="40px"
          role="button"
          style={{ cursor: 'pointer', textWrap: 'nowrap', overflow: 'hidden', outline: 'none' }}
        >
          <Row alignItems="center" position="relative" gap maxHeight="40px">
            <Icon>{teamId ? <Users /> : <User />}</Icon>
            {showText && <Text>{label}</Text>}
          </Row>
          {showText && (
            <Icon rotate={90} size="sm">
              <ChevronRight />
            </Icon>
          )}
        </Row>
      </Pressable>
      <Popover placement="bottom start">
        <Column minWidth="300px">
          <Menu autoFocus="last" onAction={handleAction}>
            <SubmenuTrigger>
              <MenuItem id="teams" showChecked={false} showSubMenuIcon>
                <IconLabel icon={<Switch />} label={formatMessage(labels.switchAccount)} />
              </MenuItem>
              <Popover placement={isMobile ? 'bottom start' : 'right top'}>
                <Column minWidth="300px">
                  <Menu selectionMode="single" selectedKeys={selectedKeys}>
                    <MenuSection title={formatMessage(labels.myAccount)}>
                      <MenuItem id="user" href={getUrl('/')}>
                        <IconLabel icon={<User />} label={user.username} />
                      </MenuItem>
                    </MenuSection>
                    <MenuSeparator />
                    <MenuSection title={formatMessage(labels.teams)}>
                      {user?.teams?.map(({ id, name }) => (
                        <MenuItem key={id} id={id} href={getUrl(`/teams/${id}`)}>
                          <IconLabel icon={<Users />}>
                            <Text wrap="nowrap">{name}</Text>
                          </IconLabel>
                        </MenuItem>
                      ))}
                      {user?.teams?.length === 0 && (
                        <MenuItem id="manage-teams">
                          <a href="/settings/teams" style={{ width: '100%' }}>
                            <Row alignItems="center" justifyContent="space-between" gap>
                              <Text align="center">Manage teams</Text>
                              <Icon>
                                <ArrowRight />
                              </Icon>
                            </Row>
                          </a>
                        </MenuItem>
                      )}
                    </MenuSection>
                  </Menu>
                </Column>
              </Popover>
            </SubmenuTrigger>
            <MenuSeparator />
            <MenuItem
              id="settings"
              href={getUrl('/settings')}
              icon={<Settings />}
              label={formatMessage(labels.settings)}
            />
            {cloudMode && (
              <>
                <MenuItem
                  id="docs"
                  href={DOCS_URL}
                  target="_blank"
                  icon={<BookText />}
                  label={formatMessage(labels.documentation)}
                >
                  <Icon color="muted">
                    <ExternalLink />
                  </Icon>
                </MenuItem>
                <MenuItem
                  id="support"
                  href={getUrl('/settings/support')}
                  icon={<LifeBuoy />}
                  label={formatMessage(labels.support)}
                />
              </>
            )}
            {!cloudMode && user.isAdmin && (
              <>
                <MenuSeparator />
                <MenuItem
                  id="/admin"
                  href="/admin"
                  icon={<LockKeyhole />}
                  label={formatMessage(labels.admin)}
                />
              </>
            )}
            <MenuSeparator />
            <MenuItem
              id="logout"
              href={getUrl('/logout')}
              icon={<LogOut />}
              label={formatMessage(labels.logout)}
            />
          </Menu>
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
