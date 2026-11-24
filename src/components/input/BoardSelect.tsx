import { type Button, Icon, Row, Text } from '@umami/react-zen';
import { type ComponentProps, useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useBoardQuery, useBoardsQuery, useMessages } from '@/components/hooks';
import { LayoutDashboard } from '@/components/icons';

export interface BoardSelectProps {
  boardId?: string;
  teamId?: string;
  isCollapsed?: boolean;
  buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  onChange?: (boardId: string) => void;
}

export function BoardSelect({
  boardId,
  teamId,
  isCollapsed,
  buttonProps,
  onChange,
}: BoardSelectProps) {
  const { t, messages } = useMessages();
  const { data: board } = useBoardQuery(boardId);
  const [name, setName] = useState<string>(board?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useBoardsQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(board?.name);
  }, [board?.name]);

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
    <SearchSelect
      value={boardId}
      items={listItems}
      isLoading={isLoading}
      onSearch={setSearch}
      onChange={handleChange}
      renderValue={renderValue()}
      emptyMessage={<Empty message={t(messages.noResultsFound)} />}
      contentStyle={{ width: 280 }}
      maxHeight={480}
      triggerProps={{
        ...buttonProps,
        style: {
          minHeight: 40,
          justifyContent: isCollapsed ? 'start' : 'space-between',
          ...buttonProps?.style,
        },
      }}
    />
  );
}
