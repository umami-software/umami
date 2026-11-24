import { type Button, Icon, Row, Text } from '@umami/react-zen';
import { type ComponentProps, useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useMessages, usePixelQuery, usePixelsQuery } from '@/components/hooks';
import { Grid2x2 } from '@/components/icons';

export interface PixelSelectProps {
  pixelId?: string;
  teamId?: string;
  isCollapsed?: boolean;
  placeholder?: string;
  buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  onChange?: (pixelId: string) => void;
}

export function PixelSelect({
  pixelId,
  teamId,
  isCollapsed,
  placeholder,
  buttonProps,
  onChange,
}: PixelSelectProps) {
  const { t, labels, messages } = useMessages();
  const { data: pixel } = usePixelQuery(pixelId);
  const [name, setName] = useState<string>(pixel?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = usePixelsQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(pixel?.name);
  }, [pixel?.name]);

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange?.(id);
  };

  const renderValue = () => {
    if (isCollapsed) {
      return '';
    }

    const value = name || placeholder || t(labels.pixel);

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Grid2x2 />
        </Icon>
        <Text truncate color={name ? undefined : 'muted-foreground'}>
          {value}
        </Text>
      </Row>
    );
  };

  return (
    <SearchSelect
      value={pixelId}
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
