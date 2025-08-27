import { useState } from 'react';
import { Select, SelectProps, ListItem, Text } from '@umami/react-zen';
import {
  useUserWebsitesQuery,
  useWebsiteQuery,
  useNavigation,
  useMessages,
} from '@/components/hooks';
import { Empty } from '@/components/common/Empty';

export function WebsiteSelect({
  websiteId,
  teamId,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
} & SelectProps) {
  const { formatMessage, messages } = useMessages();
  const { router, renderUrl } = useNavigation();
  const [search, setSearch] = useState('');
  const { data: website } = useWebsiteQuery(websiteId);
  const { data, isLoading } = useUserWebsitesQuery({ teamId }, { search, pageSize: 5 });

  const handleSelect = (value: any) => {
    router.push(renderUrl(`/websites/${value}`));
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  return (
    <Select
      {...props}
      placeholder=""
      items={data?.['data'] || []}
      value={websiteId}
      isLoading={isLoading}
      buttonProps={{ variant: 'outline' }}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleSelect}
      onOpenChange={handleOpenChange}
      listProps={{
        renderEmptyState: () => <Empty message={formatMessage(messages.noResultsFound)} />,
      }}
      renderValue={() => (
        <Text truncate weight="bold" style={{ maxWidth: 160, lineHeight: 1 }}>
          {website?.name}
        </Text>
      )}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
