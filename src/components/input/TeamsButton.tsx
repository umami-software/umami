import { Key } from 'react';
import { useRouter } from 'next/navigation';
import {
  Text,
  Icon,
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuSeparator,
  Popover,
  Row,
  Box,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useTeamsQuery, useNavigation } from '@/components/hooks';
import { Chevron, User, Users } from '@/components/icons';

export function TeamsButton({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data } = useTeamsQuery(user.id);
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
      <Button className={className} variant="quiet">
        <Row alignItems="center" gap="3">
          <Icon>{teamId ? <Users /> : <User />}</Icon>
          {showText && <Text>{teamId ? team?.name : user.username}</Text>}
          <Icon rotate={90} size="sm">
            <Chevron />
          </Icon>
        </Row>
      </Button>
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
