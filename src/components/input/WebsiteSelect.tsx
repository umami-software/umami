import { useState } from 'react';
import { Select, SelectProps, ListItem } from '@umami/react-zen';
import { useUserWebsitesQuery, useMessages, useLoginQuery } from '@/components/hooks';
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
  const [search, setSearch] = useState('');
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 5, includeTeams },
  );

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
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
      listProps={{
        renderEmptyState: () => <Empty message={formatMessage(messages.noResultsFound)} />,
      }}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
