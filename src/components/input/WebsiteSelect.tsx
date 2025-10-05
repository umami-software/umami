import { useState } from 'react';
import { Select, SelectProps, ListItem, Text, Row } from '@umami/react-zen';
import { useUserWebsitesQuery, useMessages, useLoginQuery, useWebsite } from '@/components/hooks';
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
  const website = useWebsite();
  const { formatMessage, messages } = useMessages();
  const [search, setSearch] = useState('');
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 10, includeTeams },
  );

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  const renderValue = () => {
    return (
      <Row maxWidth="160px">
        <Text truncate>{website.name}</Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      items={data?.['data'] || []}
      value={websiteId}
      isLoading={isLoading}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={onChange}
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
