import { ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import {
  useLoginQuery,
  useMessages,
  useUserWebsitesQuery,
  useWebsiteQuery,
} from '@/components/hooks';

export function WebsiteSelect({
  websiteId,
  teamId,
  onChange,
  includeTeams,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  includeTeams?: boolean;
} & SelectProps) {
  const { formatMessage, messages } = useMessages();
  const { data: website } = useWebsiteQuery(websiteId);
  const [name, setName] = useState<string>(website?.name);
  const [search, setSearch] = useState('');
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 20, includeTeams },
  );
  const listItems: { id: string; name: string }[] = data?.data || [];

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange(id);
  };

  const renderValue = () => {
    return (
      <Row maxWidth="160px">
        <Text truncate>{name}</Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      value={websiteId}
      isLoading={isLoading}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleChange}
      onOpenChange={handleOpenChange}
      renderValue={renderValue}
      listProps={{
        renderEmptyState: () => <Empty message={formatMessage(messages.noResultsFound)} />,
        style: { maxHeight: 'calc(42vh - 65px)', width: 280 },
      }}
      buttonProps={{ style: { minHeight: 40 } }}
    >
      {listItems.map(({ id, name }) => (
        <ListItem key={id} id={id}>
          {name}
        </ListItem>
      ))}
    </Select>
  );
}
