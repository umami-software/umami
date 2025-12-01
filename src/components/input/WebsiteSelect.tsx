import { useState } from 'react';
import { Select, SelectProps, ListItem, Text, Row } from '@umami/react-zen';
import {
  useUserWebsitesQuery,
  useMessages,
  useLoginQuery,
  useWebsiteQuery,
} from '@/components/hooks';
import { Empty } from '@/components/common/Empty';

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
    { search, pageSize: 10, includeTeams },
  );
  const listItems: { id: string; name: string }[] = data?.['data'] || [];

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
      items={listItems}
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
        style: { maxHeight: '400px' },
      }}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
