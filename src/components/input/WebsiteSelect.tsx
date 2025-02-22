import { useState, Key } from 'react';
import { Dropdown, Item } from 'react-basics';
import { useWebsite, useWebsites, useMessages } from '@/components/hooks';
import Empty from '@/components/common/Empty';
import styles from './WebsiteSelect.module.css';

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

  const renderValue = () => {
    return website?.name;
  };

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
    <Dropdown
      menuProps={{ className: styles.dropdown }}
      items={queryResult?.result?.data as any[]}
      value={selectedId as string}
      renderValue={renderValue}
      renderEmpty={renderEmpty}
      onChange={handleSelect}
      alignment="end"
      placeholder={formatMessage(labels.selectWebsite)}
      allowSearch={true}
      onSearch={handleSearch}
      isLoading={queryResult.query.isLoading}
    >
      {({ id, name }) => <Item key={id}>{name}</Item>}
    </Dropdown>
  );
}

export default WebsiteSelect;
