import { useState } from 'react';
import { Select, ListItem } from '@umami/react-zen';
import { useWebsites, useMessages } from '@/components/hooks';
import type { SelectProps } from '@umami/react-zen/Select';

export function WebsiteSelect({
  websiteId,
  teamId,
  variant,
  onSelect,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger' | 'zero';
  onSelect?: (key: any) => void;
} & SelectProps) {
  const { formatMessage, labels } = useMessages();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(websiteId);

  const queryResult = useWebsites({ teamId }, { search, pageSize: 5 });

  const handleSelect = (value: any) => {
    setSelectedId(value);
    onSelect?.(value);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const items = queryResult?.result?.data as any[];

  return (
    <Select
      {...props}
      items={items}
      value={selectedId}
      placeholder={formatMessage(labels.selectWebsite)}
      isLoading={queryResult.query.isLoading}
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
