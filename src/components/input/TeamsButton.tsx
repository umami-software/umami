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
import { Chevron, User, Users } from '@/components/icons';

export function TeamsButton({ showText = true }: { showText?: boolean }) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data } = useUserTeamsQuery(user.id);
  const { teamId } = useNavigation();
  const router = useRouter();
  const team = data?.data?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || user.id]);

  const handleSelect = (id: Key) => {
    router.push(id === user.id ? '/websites' : `/teams/${id}/websites`);
  };

  if (!data?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Pressable>
        <SidebarItem
          label={teamId ? team?.name : user.username}
          icon={teamId ? <Users /> : <User />}
        >
          <Row alignItems="center" justifyContent="space-between" width="100%" gap>
            {showText && (
              <Icon rotate={90} size="sm">
                <Chevron />
              </Icon>
            )}
          </Row>
        </SidebarItem>
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
                <Icon>
                  <User />
                </Icon>
                <Text wrap="nowrap">{user.username}</Text>
              </MenuItem>
            </MenuSection>
            <MenuSeparator />
            <MenuSection title={formatMessage(labels.teams)}>
              {data?.data?.map(({ id, name }) => (
                <MenuItem key={id} id={id}>
                  <Icon size="sm">
                    <Users />
                  </Icon>
                  <Text wrap="nowrap">{name}</Text>
                </MenuItem>
              ))}
            </MenuSection>
          </Menu>
        </Box>
      </Popover>
    </MenuTrigger>
  );
}
