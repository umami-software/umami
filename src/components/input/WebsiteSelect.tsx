import { useState } from 'react';
import { Select, SelectProps, ListItem } from '@umami/react-zen';
import { useUserWebsitesQuery, useWebsiteQuery, useNavigation } from '@/components/hooks';

export function WebsiteSelect({
  websiteId,
  teamId,
  variant,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  variant?: 'primary' | 'outline' | 'quiet' | 'danger' | 'zero';
} & SelectProps) {
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

  return (
    <Select
      {...props}
      items={data?.['data'] || []}
      value={websiteId}
      isLoading={isLoading}
      buttonProps={{ variant }}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleSelect}
      renderValue={() => website?.name}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
