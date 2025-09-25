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
import { useConfig, useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
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
import { DOCS_URL } from '@/lib/constants';
import * as url from 'node:url';

export interface TeamsButtonProps {
  showText?: boolean;
  onAction?: (id: any) => void;
}

export function NavButton({ showText = true }: TeamsButtonProps) {
  const { user } = useLoginQuery();
  const { cloudMode } = useConfig();
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}/${url}` : url;
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
          style={{ cursor: 'pointer', textWrap: 'nowrap', outline: 'none' }}
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
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onAction={handleAction}
          >
            <MenuSection title={formatMessage(labels.myAccount)}>
              <MenuItem id="user">
                <IconLabel icon={<User />} label={user.username} />
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <SubmenuTrigger>
              <MenuItem id="teams" showChecked={false} showSubMenuIcon>
                <IconLabel icon={<Users />} label={formatMessage(labels.teams)} />
              </MenuItem>
              <Popover placement="right top">
                <Column minWidth="300px">
                  <Menu>
                    <MenuSection title={formatMessage(labels.teams)}>
                      {user?.teams?.map(({ id, name }) => (
                        <MenuItem key={id} id={id}>
                          <Row alignItems="center" gap>
                            <Icon size="sm">
                              <Users />
                            </Icon>
                            <Text wrap="nowrap">{name}</Text>
                          </Row>
                        </MenuItem>
                      ))}
                    </MenuSection>
                  </Menu>
                </Column>
              </Popover>
            </SubmenuTrigger>
            <MenuItem id="settings" icon={<Settings />} label={formatMessage(labels.settings)} />
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
            {user.isAdmin && (
              <>
                <MenuSeparator />
                <MenuItem id="/admin" icon={<LockKeyhole />} label={formatMessage(labels.admin)} />
              </>
            )}
            <MenuSeparator />
            <MenuItem id="/logout" icon={<LogOut />} label={formatMessage(labels.logout)} />
          </Menu>
        </Column>
      </Popover>
    </MenuTrigger>
  );
}
