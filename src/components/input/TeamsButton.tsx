import { Key } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuSeparator,
  Popover,
  Row,
  Box,
  SidebarItem,
  Pressable,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useUserTeamsQuery, useNavigation } from '@/components/hooks';
import { Chevron, User, Users, LogOut } from '@/components/icons';

export function TeamsButton({ showText = true }: { showText?: boolean }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data } = useUserTeamsQuery(user.id);
  const { teamId } = useNavigation();
  const router = useRouter();
  const team = data?.data?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || user.id]);
  const label = teamId ? team?.name : user.username;

  const handleSelect = (id: Key) => {
    router.push(id === user.id ? '/websites' : `/teams/${id}/websites`);
  };

  if (!data?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Pressable>
        <Row width="100%" backgroundColor="2" border borderRadius>
          <SidebarItem label={label} icon={teamId ? <Users /> : <User />}>
            {showText && (
              <Icon rotate={90} size="sm">
                <Chevron />
              </Icon>
            )}
          </SidebarItem>
        </Row>
      </Pressable>
      <Popover placement="bottom start">
        <Box minWidth="300px">
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onAction={handleSelect}
          >
            <MenuSection title={formatMessage(labels.myAccount)}>
              <MenuItem id={user.id}>
                <Row alignItems="center" gap>
                  <Icon>
                    <User />
                  </Icon>
                  <Text wrap="nowrap">{user.username}</Text>
                </Row>
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title={formatMessage(labels.teams)}>
              {data?.data?.map(({ id, name }) => (
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
            <MenuSeparator />
            <MenuSection>
              <MenuItem id="logout">
                <Row alignItems="center" gap>
                  <Icon size="sm">
                    <LogOut />
                  </Icon>
                  <Text wrap="nowrap">{formatMessage(labels.logout)}</Text>
                </Row>
              </MenuItem>
            </MenuSection>
          </Menu>
        </Box>
      </Popover>
    </MenuTrigger>
  );
}
