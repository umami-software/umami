import { useState, Key } from 'react';
import { Dropdown, Item } from 'react-basics';
import { useApi } from 'components/hooks';
import { useMessages } from 'components/hooks';
import styles from './WebsiteSelect.module.css';
import Empty from 'components/common/Empty';

export function WebsiteSelect({
  websiteId,
  onSelect,
}: {
  websiteId?: string;
  onSelect?: (key: any) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<Key>(websiteId);
  const { formatMessage, labels, messages } = useMessages();
  const { get, useQuery } = useApi();
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites:me', { query }],
    queryFn: () => get('/me/websites', { query, pageSize: 5 }),
  });
  const { data: website } = useQuery({
    queryKey: ['websites', { selectedId }],
    queryFn: () => get(`/websites/${selectedId}`),
    enabled: !!selectedId,
  });

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
    setQuery(value);
  };

  return (
    <Dropdown
      menuProps={{ className: styles.dropdown }}
      items={websites?.data}
      value={selectedId as string}
      renderValue={renderValue}
      renderEmpty={renderEmpty}
      onChange={handleSelect}
      alignment="end"
      placeholder={formatMessage(labels.selectWebsite)}
      allowSearch={true}
      onSearch={handleSearch}
      isLoading={isLoading}
    >
      {({ id, name }) => <Item key={id}>{name}</Item>}
    </Dropdown>
  );
}

export default WebsiteSelect;
