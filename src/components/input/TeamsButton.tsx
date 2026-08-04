import {
  Button,
  DialogTrigger,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  Popover,
  Row,
  Text,
} from '@umami/react-zen';
import { ArrowRight } from 'lucide-react';
import type { Key } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import { useLoginQuery, useMessages, useMobile, useNavigation } from '@/components/hooks';
import { ChevronRight, User, Users } from '@/components/icons';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem } from '@/lib/storage';

export function TeamsButton() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { teamId, router } = useNavigation();
  const { isPhone } = useMobile();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

  const cloudMode = !!process.env.cloudMode;

  const getUrl = (url: string) => {
    return cloudMode ? `${process.env.cloudUrl}${url}` : url;
  };

  const handleNavigate = (url: string) => {
    if (cloudMode) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  const handleAction = async (key: Key) => {
    if (key === 'user') {
      removeItem(LAST_TEAM_CONFIG);
      if (cloudMode) {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
  };

  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Row
          alignItems="center"
          position="relative"
          gap
          maxHeight="40px"
          minWidth={isPhone ? '100px' : '200px'}
          maxWidth="200px"
        >
          <Icon>{teamId ? <Users /> : <User />}</Icon>
          <Text truncate>{label}</Text>
        </Row>
        <Icon rotate={90} size="sm">
          <ChevronRight />
        </Icon>
      </Button>
      <Popover side="bottom" align="start" sideOffset={4}>
        <Menu className="min-w-[300px]" selectionMode="single" selectedKeys={selectedKeys}>
          <MenuSection title={t(labels.myAccount)}>
            <MenuItem id="user" onAction={handleAction}>
              <IconLabel icon={<User />} label={user.username} />
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuSection title={t(labels.teams)}>
            {user?.teams?.map(({ id, name }) => (
              <MenuItem key={id} id={id} onAction={() => handleNavigate(getUrl(`/teams/${id}`))}>
                <IconLabel icon={<Users />}>
                  <Text wrap="nowrap">{name}</Text>
                </IconLabel>
              </MenuItem>
            ))}
            <MenuSeparator />
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
          </MenuSection>
        </Menu>
      </Popover>
    </DialogTrigger>
  );
}
