import { useState } from 'react';
import type { Selection } from 'react-aria-components';
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
  Icons,
} from '@umami/react-zen';
import { User, Users } from 'lucide-react';
import { useLogin, useMessages, useTeams, useTeamUrl } from '@/components/hooks';

export function TeamsButton({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  const { user } = useLogin();
  const { formatMessage, labels } = useMessages();
  const { result } = useTeams(user.id);
  const { teamId } = useTeamUrl();
  const router = useRouter();
  const team = result?.data?.find(({ id }) => id === teamId);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([teamId || user.id]));

  const handleSelect = (keys: Set<string>) => {
    if (keys.size > 0) {
      const [id] = [...keys];

      router.push(id === user.id ? '/dashboard' : `/teams/${id}/dashboard`);

      setSelectedKeys(keys);
    }
  };

  if (!result?.count) {
    return null;
  }

  return (
    <MenuTrigger>
      <Button className={className} variant="quiet">
        <Row alignItems="center" gap="3">
          <Icon>{teamId ? <Users /> : <User />}</Icon>
          {showText && <Text weight="bold">{teamId ? team?.name : user.username}</Text>}
          <Icon rotate={90} size="xs">
            <Icons.Chevron />
          </Icon>
        </Row>
      </Button>
      <Popover placement="bottom end">
        <Box minWidth={300}>
          <Menu
            selectionMode="single"
            selectedKeys={selectedKeys}
            autoFocus="last"
            onSelectionChange={keys => handleSelect(keys as Set<string>)}
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
              {result?.data?.map(({ id, name }) => (
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
