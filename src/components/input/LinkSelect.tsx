import { Icon, ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useLinkQuery, useLinksQuery, useMessages } from '@/components/hooks';
import { Link } from '@/components/icons';

export function LinkSelect({
  linkId,
  teamId,
  onChange,
  isCollapsed,
  buttonProps,
  listProps,
  ...props
}: {
  linkId?: string;
  teamId?: string;
  isCollapsed?: boolean;
} & SelectProps) {
  const { t, messages } = useMessages();
  const { data: link } = useLinkQuery(linkId);
  const [name, setName] = useState<string>(link?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useLinksQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(link?.name);
  }, [link?.name]);

  const handleOpenChange = () => {
    setSearch('');
  };

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange?.(id);
  };

  const renderValue = () => {
    if (isCollapsed) {
      return '';
    }

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Link />
        </Icon>
        <Text truncate>{name}</Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      value={linkId}
      isLoading={isLoading}
      allowSearch={true}
      searchValue={search}
      onSearch={setSearch}
      onChange={handleChange}
      onOpenChange={handleOpenChange}
      renderValue={renderValue}
      buttonProps={{
        ...buttonProps,
        style: {
          minHeight: 40,
          gap: 0,
          justifyContent: isCollapsed ? 'start' : undefined,
          ...buttonProps?.style,
        },
      }}
      listProps={{
        ...listProps,
        renderEmptyState:
          listProps?.renderEmptyState || (() => <Empty message={t(messages.noResultsFound)} />),
        style: {
          maxHeight: 'calc(42vh - 65px)',
          width: 280,
          ...listProps?.style,
        },
      }}
    >
      {listItems.map(({ id, name }) => (
        <ListItem key={id} id={id}>
          {name}
        </ListItem>
      ))}
    </Select>
  );
}
