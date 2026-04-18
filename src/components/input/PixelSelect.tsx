import { Icon, ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { useMessages, usePixelQuery, usePixelsQuery } from '@/components/hooks';
import { Grid2x2 } from '@/components/icons';

export function PixelSelect({
  pixelId,
  teamId,
  onChange,
  isCollapsed,
  buttonProps,
  listProps,
  ...props
}: {
  pixelId?: string;
  teamId?: string;
  isCollapsed?: boolean;
} & SelectProps) {
  const { t, labels, messages } = useMessages();
  const { data: pixel } = usePixelQuery(pixelId);
  const [name, setName] = useState<string>(pixel?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = usePixelsQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(pixel?.name);
  }, [pixel?.name]);

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

    const value = name || props.placeholder || t(labels.pixel);

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Grid2x2 />
        </Icon>
        <Text truncate color={name ? undefined : 'muted'}>
          {value}
        </Text>
      </Row>
    );
  };

  return (
    <Select
      {...props}
      value={pixelId}
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
      maxHeight={480}
      listProps={{
        ...listProps,
        renderEmptyState:
          listProps?.renderEmptyState || (() => <Empty message={t(messages.noResultsFound)} />),
        style: {
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
