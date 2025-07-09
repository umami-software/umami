import { useState } from 'react';
import { Select, SelectProps, ListItem } from '@umami/react-zen';
import { useUserWebsitesQuery, useMessages } from '@/components/hooks';

export function WebsiteSelect({
  websiteId,
  teamId,
  variant,
  onSelect,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  variant?: 'primary' | 'outline' | 'quiet' | 'danger' | 'zero';
  onSelect?: (key: any) => void;
} & SelectProps) {
  const { formatMessage, labels } = useMessages();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(websiteId);

  const { data, isLoading } = useUserWebsitesQuery({ teamId }, { search, pageSize: 5 });

  const handleSelect = (value: any) => {
    setSelectedId(value);
    onSelect?.(value);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <Select
      {...props}
      items={data?.['data'] || []}
      value={selectedId}
      placeholder={formatMessage(labels.selectWebsite)}
      isLoading={isLoading}
      buttonProps={{ variant }}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
      onChange={handleSelect}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
