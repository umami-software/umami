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
  Button,
  Loading,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useUserTeamsQuery, useNavigation } from '@/components/hooks';
import { Chevron, User, Users } from '@/components/icons';

export interface TeamsButtonProps {
  showText?: boolean;
  onAction?: (id: any) => void;
}

export function TeamsButton({ showText = true, onAction }: TeamsButtonProps) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { data, isLoading } = useUserTeamsQuery(user.id);
  const { teamId } = useNavigation();
  const team = data?.data?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

  if (isLoading) {
    return <Loading icon="dots" position="center" />;
  }

  if (!data?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Button variant="outline">
        <Row alignItems="center" justifyContent="space-between" flexGrow={1}>
          <Row alignItems="center" gap>
            <Icon>{teamId ? <Users /> : <User />}</Icon>
            {showText && <Text>{label}</Text>}
          </Row>
          {showText && (
            <Icon rotate={90} size="sm">
              <Chevron />
            </Icon>
          )}
        </Row>
      </Button>
      <Popover placement="bottom start">
        <Box minWidth="300px">
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onAction={onAction}
          >
            <MenuSection title={formatMessage(labels.myAccount)}>
              <MenuItem id={'user'}>
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
          </Menu>
        </Box>
      </Popover>
    </MenuTrigger>
  );
}
