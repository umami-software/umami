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
  Column,
  Pressable,
} from '@umami/react-zen';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';
import { ChevronRight, User, Users } from '@/components/icons';

export interface TeamsButtonProps {
  showText?: boolean;
  onAction?: (id: any) => void;
}

export function NavButton({ showText = true, onAction }: TeamsButtonProps) {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

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
    </MenuTrigger>
  );
}
