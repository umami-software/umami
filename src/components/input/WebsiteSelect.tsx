import { useState } from 'react';
import { Select, SelectProps, ListItem } from '@umami/react-zen';
import { useUserWebsitesQuery, useWebsiteQuery, useNavigation } from '@/components/hooks';
import { ButtonProps } from 'react-basics';

export function WebsiteSelect({
  websiteId,
  teamId,
  buttonProps,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  buttonProps?: ButtonProps;
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
      placeholder=""
      items={data?.['data'] || []}
      value={websiteId}
      isLoading={isLoading}
      buttonProps={buttonProps}
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
