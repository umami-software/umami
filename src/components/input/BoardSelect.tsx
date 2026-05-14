import { Icon, ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useBoardQuery, useBoardsQuery, useMessages } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';

export function BoardSelect({
  boardId,
  teamId,
  onChange,
  isCollapsed,
  buttonProps,
  listProps,
  ...props
}: {
  boardId?: string;
  teamId?: string;
  isCollapsed?: boolean;
} & SelectProps) {
  const { t, messages } = useMessages();
  const { data: board } = useBoardQuery(boardId);
  const [name, setName] = useState<string>(board?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useBoardsQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(board?.name);
  }, [board?.name]);

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
          <LayoutDashboard />
        </Icon>
        <Text truncate>{name}</Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      value={boardId}
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
