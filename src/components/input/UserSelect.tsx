import { ListItem, Select, type SelectProps } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMessages, useTeamMembersQuery, useUsersQuery } from '@/components/hooks';

export function UserSelect({
  teamId,
  onChange,
  ...props
}: {
  teamId?: string;
} & SelectProps) {
  const { formatMessage, messages } = useMessages();
  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembersQuery(teamId);
  const [username, setUsername] = useState<string>();
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

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  const handleChange = (id: string) => {
    setUsername(listItems.find(item => item.id === id)?.username);
    onChange(id);
  };

  return (
    <Select
      {...props}
      value={username}
      isLoading={usersLoading || (teamId && teamMembersLoading)}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleChange}
      onOpenChange={handleOpenChange}
      listProps={{
        renderEmptyState: () => <Empty message={formatMessage(messages.noResultsFound)} />,
        style: { maxHeight: 'calc(42vh - 65px)' },
      }}
    >
      {listItems.map(({ id, username }) => (
        <ListItem key={id} id={id}>
          {username}
        </ListItem>
      ))}
    </Select>
  );
}
