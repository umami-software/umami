import { Icon, ListItem, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import {
  useLoginQuery,
  useMessages,
  useUserWebsitesQuery,
  useWebsiteQuery,
} from '@/components/hooks';
import { Globe } from '@/components/icons';

export function WebsiteSelect({
  websiteId,
  teamId,
  onChange,
  includeTeams,
  isCollapsed,
  buttonProps,
  listProps,
  ...props
}: {
  websiteId?: string;
  teamId?: string;
  includeTeams?: boolean;
  isCollapsed?: boolean;
} & SelectProps) {
  const { t, labels, messages } = useMessages();
  const { data: website } = useWebsiteQuery(websiteId);
  const [name, setName] = useState<string>(website?.name);
  const [search, setSearch] = useState('');
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 20, includeTeams },
  );
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(website?.name);
  }, [website?.name]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleOpenChange = () => {
    setSearch('');
  };

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange(id);
  };

  const renderValue = () => {
    if (isCollapsed) {
      return '';
    }

    const value = name || props.placeholder || t(labels.selectWebsite);

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Globe />
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
      value={websiteId}
      isLoading={isLoading}
      allowSearch={true}
      searchValue={search}
      onSearch={handleSearch}
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
