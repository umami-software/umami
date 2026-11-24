import { type Button, Text } from '@umami/react-zen';
import { type ComponentProps, useMemo, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useMessages, useTeamMembersQuery, useUsersQuery } from '@/components/hooks';

export interface UserSelectProps {
  teamId?: string;
  value?: string;
  buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  onValueChange?: (userId: string) => void;
}

export function UserSelect({ teamId, value, buttonProps, onValueChange }: UserSelectProps) {
  const { t, messages } = useMessages();
  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembersQuery(teamId);
  const [search, setSearch] = useState('');

  const listItems = useMemo(() => {
    if (!users) {
      return [];
    }
    if (!teamId || !teamMembers) {
      return users.data;
    }
    const teamMemberIds = teamMembers.data.map(({ userId }) => userId);
    return users.data.filter(({ id }) => !teamMemberIds.includes(id));
  }, [users, teamMembers, teamId]);

  const items = listItems
    .filter(({ username }) => !search || username.toLowerCase().includes(search.toLowerCase()))
    .map(({ id, username }) => ({ id, name: username }));

  const username = listItems.find(({ id }) => id === value)?.username;

  return (
    <SearchSelect
      value={value}
      items={items}
      isLoading={usersLoading || (!!teamId && teamMembersLoading)}
      onSearch={setSearch}
      onChange={onValueChange}
      maxHeight={480}
      emptyMessage={<Empty message={t(messages.noResultsFound)} />}
      renderValue={<Text truncate>{username}</Text>}
      triggerProps={{
        ...buttonProps,
        className: ['w-full justify-between', buttonProps?.className].filter(Boolean).join(' '),
      }}
    />
  );
}
