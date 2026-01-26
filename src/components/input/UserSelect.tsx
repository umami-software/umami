import { ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
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

  const renderValue = () => {
    return (
      <Row maxWidth="160px">
        <Text truncate>{username}</Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      items={listItems}
      value={username}
      isLoading={usersLoading || (teamId && teamMembersLoading)}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleChange}
      onOpenChange={handleOpenChange}
      renderValue={renderValue}
      listProps={{
        renderEmptyState: () => <Empty message={formatMessage(messages.noResultsFound)} />,
        style: { maxHeight: 'calc(42vh - 65px)' },
      }}
    >
      {({ id, username }: any) => <ListItem key={id}>{username}</ListItem>}
    </Select>
  );
}
