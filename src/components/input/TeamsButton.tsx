import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Row,
  Text,
} from '@umami/react-zen';
import { ArrowRight } from 'lucide-react';
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
  const selectedKey = teamId || 'user';
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

  const handleUserSelect = () => {
    removeItem(LAST_TEAM_CONFIG);
    if (cloudMode) {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="hover:bg-input dark:hover:bg-input" />}
      >
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto" style={{ minWidth: 300 }}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t(labels.myAccount)}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={selectedKey}>
            <DropdownMenuRadioItem value="user" closeOnClick onClick={handleUserSelect}>
              <IconLabel icon={<User />} label={user.username} />
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t(labels.teams)}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={selectedKey}>
            {user?.teams?.map(({ id, name, billingStatus }) => (
              <DropdownMenuRadioItem
                key={id}
                value={id}
                closeOnClick
                onClick={() => handleNavigate(getUrl(`/teams/${id}`))}
                style={billingStatus === 'past_due' ? { opacity: 0.5 } : undefined}
              >
                <IconLabel icon={<Users />}>
                  <Text wrap="nowrap">{name}</Text>
                </IconLabel>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleNavigate(getUrl('/settings/teams'))}>
            <Row alignItems="center" justifyContent="space-between" gap width="100%">
              <Text align="center">Manage teams</Text>
              <Icon>
                <ArrowRight />
              </Icon>
            </Row>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
