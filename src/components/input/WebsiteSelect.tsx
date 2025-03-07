import { useState, Key } from 'react';
import { Select, ListItem } from '@umami/react-zen';
import { useWebsite, useWebsites, useMessages } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';

export function WebsiteSelect({
  websiteId,
  teamId,
  onSelect,
}: {
  websiteId?: string;
  teamId?: string;
  onSelect?: (key: any) => void;
}) {
  const { formatMessage, labels, messages } = useMessages();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<Key>(websiteId);

  const { data: website } = useWebsite(selectedId as string);

  const queryResult = useWebsites({ teamId }, { search, pageSize: 5 });

  const renderEmpty = () => {
    return <Empty message={formatMessage(messages.noResultsFound)} />;
  };

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
