import {
  Button,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  Row,
  Text,
} from '@umami/react-zen';
import { ArrowRight } from 'lucide-react';
import { type Key, useEffect } from 'react';
import { IconLabel } from '@/components/common/IconLabel';
import {
  useApi,
  useLoginQuery,
  useMessages,
  useMobile,
  useModified,
  useNavigation,
} from '@/components/hooks';
import { ChevronRight, User, Users } from '@/components/icons';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem } from '@/lib/storage';
import { setUser, useApp } from '@/store/app';

export function TeamsButton() {
  const { user } = useLoginQuery();
  const { post } = useApi();
  const { modified } = useModified('teams');
  const { t, labels } = useMessages();
  const { teamId, router } = useNavigation();
  const { isPhone } = useMobile();
  const team = user?.teams?.find(({ id }) => id === teamId);
  const selectedKeys = new Set([teamId || 'user']);
  const label = teamId ? team?.name : user.username;

  const cloudMode = !!process.env.cloudMode;

  // The user's teams are loaded once with the login. Reload them when teams are
  // created, joined, left, renamed or deleted so the menu stays current. This is
  // kept out of the shared login query: an error there signs the user out, while
  // a failed refresh here should just keep the current list.
  useEffect(() => {
    if (!modified) {
      return;
    }

    post('/auth/verify')
      .then(({ teams }) => {
        const { user } = useApp.getState();

        if (user) {
          setUser({ ...user, teams });
        }
      })
      .catch(() => {});
  }, [modified, post]);

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
    <MenuTrigger>
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
      <Menu className="min-w-[300px]" selectionMode="single" selectedKeys={selectedKeys}>
        <MenuSection title={t(labels.myAccount)}>
          <MenuItem id="user" onAction={handleAction}>
            <IconLabel icon={<User />} label={user.username} />
          </MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection title={t(labels.teams)}>
          {user?.teams?.map(({ id, name, billingStatus }) => (
            <MenuItem
              key={id}
              id={id}
              onAction={() => handleNavigate(getUrl(`/teams/${id}`))}
              style={billingStatus === 'past_due' ? { opacity: 0.5 } : undefined}
            >
              <IconLabel icon={<Users />}>
                <Text wrap="nowrap">{name}</Text>
              </IconLabel>
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem id="manage-teams" onAction={() => handleNavigate(getUrl('/settings/teams'))}>
            <Row alignItems="center" justifyContent="space-between" gap width="100%">
              <Text align="center">Manage teams</Text>
              <Icon>
                <ArrowRight />
              </Icon>
            </Row>
          </MenuItem>
        </MenuSection>
      </Menu>
    </MenuTrigger>
  );
}
