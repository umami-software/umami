import { Icon, ListItem, ListSection, Row, Select, type SelectProps, Text } from '@umami/react-zen';
import { useEffect, useMemo, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import {
  useLoginQuery,
  useMessages,
  useUserWebsitesQuery,
  useWebsiteQuery,
  useWebsiteTreeQuery,
} from '@/components/hooks';
import { Globe } from '@/components/icons';
import { flattenTreeForSelect, buildGroupedSelectSections } from '@/lib/websiteTree';

function renderGroupedSelectItems(tree: ReturnType<typeof flattenTreeForSelect>) {
  return buildGroupedSelectSections(tree).map(entry => {
    if (entry.type === 'website') {
      return (
        <ListItem key={entry.id} id={entry.id}>
          {entry.label}
        </ListItem>
      );
    }

    return (
      <ListSection key={entry.title} title={entry.title}>
        {entry.websites.map(website => (
          <ListItem key={website.id} id={website.id}>
            {website.label}
          </ListItem>
        ))}
      </ListSection>
    );
  });
}

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
  const isSearching = !!search;

  const { data: tree, isLoading: treeLoading } = useWebsiteTreeQuery(
    { teamId },
    { enabled: !isSearching && !includeTeams },
  );

  const { data: flatData, isLoading: flatLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 100, includeTeams },
    { enabled: isSearching || !!includeTeams },
  );

  const flatItems = flatData?.data || [];
  const treeItems = useMemo(() => (tree ? flattenTreeForSelect(tree) : []), [tree]);
  const websiteItems = treeItems.filter(item => item.type === 'website');

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
    const selected =
      flatItems.find(item => item.id === id) || websiteItems.find(item => item.id === id);
    setName(selected?.name ?? selected?.label);
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

  const isLoading = isSearching || includeTeams ? flatLoading : treeLoading;

  const listContent = isSearching || includeTeams
    ? flatItems.map(({ id, name: itemName, groupPath }) => (
        <ListItem key={id} id={id}>
          {groupPath ? `${groupPath} / ${itemName}` : itemName}
        </ListItem>
      ))
    : renderGroupedSelectItems(treeItems);

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
      {listContent}
    </Select>
  );
}
