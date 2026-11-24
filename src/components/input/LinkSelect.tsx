import { type Button, Icon, Row, Text } from '@umami/react-zen';
import { type ComponentProps, useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useLinkQuery, useLinksQuery, useMessages } from '@/components/hooks';
import { Link } from '@/components/icons';

export interface LinkSelectProps {
  linkId?: string;
  teamId?: string;
  isCollapsed?: boolean;
  placeholder?: string;
  buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  onChange?: (linkId: string) => void;
}

export function LinkSelect({
  linkId,
  teamId,
  isCollapsed,
  placeholder,
  buttonProps,
  onChange,
}: LinkSelectProps) {
  const { t, labels, messages } = useMessages();
  const { data: link } = useLinkQuery(linkId);
  const [name, setName] = useState<string>(link?.name);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useLinksQuery({ teamId }, { search, pageSize: 20 });
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(link?.name);
  }, [link?.name]);

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange?.(id);
  };

  const renderValue = () => {
    if (isCollapsed) {
      return '';
    }

    const value = name || placeholder || t(labels.link);

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Link />
        </Icon>
        <Text truncate color={name ? undefined : 'muted-foreground'}>
          {value}
        </Text>
      </Row>
    );
  };

  return (
    <SearchSelect
      value={linkId}
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
