import { type Button, Icon, Row, Text } from '@umami/react-zen';
import { type ComponentProps, useEffect, useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { SearchSelect } from '@/components/common/SearchSelect';
import {
  useLoginQuery,
  useMessages,
  useUserWebsitesQuery,
  useWebsiteQuery,
} from '@/components/hooks';
import { Globe } from '@/components/icons';

export interface WebsiteSelectProps {
  websiteId?: string;
  teamId?: string;
  includeTeams?: boolean;
  isCollapsed?: boolean;
  placeholder?: string;
  buttonProps?: Omit<ComponentProps<typeof Button>, 'children'>;
  onChange?: (websiteId: string) => void;
}

export function WebsiteSelect({
  websiteId,
  teamId,
  includeTeams,
  isCollapsed,
  placeholder,
  buttonProps,
  onChange,
}: WebsiteSelectProps) {
  const { t, labels, messages } = useMessages();
  const { data: website } = useWebsiteQuery(websiteId);
  const [name, setName] = useState<string>(website?.name);
  const [search, setSearch] = useState('');
  const { user } = useLoginQuery();
  const { data, isLoading } = useUserWebsitesQuery(
    { userId: user?.id, teamId },
    { search, pageSize: 100, includeTeams: includeTeams || undefined },
  );
  const listItems: { id: string; name: string }[] = data?.data || [];

  useEffect(() => {
    setName(website?.name);
  }, [website?.name]);

  const handleChange = (id: string) => {
    setName(listItems.find(item => item.id === id)?.name);
    onChange?.(id);
  };

  const renderValue = () => {
    if (isCollapsed) {
      return '';
    }

    const value = name || placeholder || t(labels.selectWebsite);

    return (
      <Row alignItems="center" gap>
        <Icon>
          <Globe />
        </Icon>
        <Text truncate color={name ? undefined : 'muted-foreground'}>
          {value}
        </Text>
      </Row>
    );
  };

  return (
    <SearchSelect
      value={websiteId ?? null}
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
        variant: 'ghost',
        style: {
          justifyContent: isCollapsed ? 'start' : undefined,
          ...buttonProps?.style,
        },
      }}
    />
  );
}
