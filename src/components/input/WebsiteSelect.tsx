import { useState, Key } from 'react';
import { Select, ListItem } from '@umami/react-zen';
import { useWebsites, useMessages } from '@/components/hooks';

export function WebsiteSelect({
  websiteId,
  teamId,
  onSelect,
}: {
  websiteId?: string;
  teamId?: string;
  onSelect?: (key: any) => void;
}) {
  const { formatMessage, labels } = useMessages();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<Key>(websiteId);

  const queryResult = useWebsites({ teamId }, { search, pageSize: 5 });

  const handleSelect = (value: any) => {
    setSelectedId(value);
    onSelect?.(value);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <Select
      items={queryResult?.result?.data as any[]}
      value={selectedId as string}
      onChange={handleSelect}
      placeholder={formatMessage(labels.selectWebsite)}
      allowSearch={true}
      onSearch={handleSearch}
      isLoading={queryResult.query.isLoading}
    >
      {({ id, name }: any) => <ListItem key={id}>{name}</ListItem>}
    </Select>
  );
}
