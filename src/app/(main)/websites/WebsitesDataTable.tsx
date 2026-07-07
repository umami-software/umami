import { Column, Icon, Loading, Row, SearchField, Text } from '@umami/react-zen';
import { useState } from 'react';
import { Empty } from '@/components/common/Empty';
import { DataGrid } from '@/components/common/DataGrid';
import Link from '@/components/common/Link';
import {
  useLoginQuery,
  useModified,
  useNavigation,
  useUserWebsitesQuery,
  useWebsiteTreeQuery,
} from '@/components/hooks';
import { WebsiteTreeTable } from '@/components/websites/WebsiteTreeTable';
import { Favicon } from '@/index';
import { WebsitesTable } from './WebsitesTable';

export function WebsitesDataTable({
  userId,
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
}: {
  userId?: string;
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
}) {
  const { user } = useLoginQuery();
  const { renderUrl, query: navQuery, router, updateParams } = useNavigation();
  const { touch } = useModified();
  const [search, setSearch] = useState(navQuery?.search || '');
  const isSearching = !!navQuery?.search;

  const treeQuery = useWebsiteTreeQuery({ teamId }, { enabled: !isSearching });
  const flatQuery = useUserWebsitesQuery(
    { userId: userId || user?.id, teamId },
    { search: navQuery?.search },
    { enabled: isSearching },
  );

  const renderLink = (row: any) => (
    <Row alignItems="center" gap="3" minWidth="0" width="100%">
      <Icon size="md" color="muted" style={{ flexShrink: 0 }}>
        <Favicon domain={row.domain} />
      </Icon>
      <Text truncate title={row.name} style={{ maxWidth: '100%' }}>
        <Link href={renderUrl(`/websites/${row.id}`, false)}>{row.name}</Link>
      </Text>
    </Row>
  );

  const handleModified = () => {
    touch('websites');
    touch('website-groups');
  };

  const handleSearch = (value: string) => {
    if (value !== search) {
      setSearch(value);
      router.push(updateParams({ search: value, page: 1 }));
    }
  };

  if (isSearching) {
    return (
      <DataGrid query={flatQuery} allowSearch allowPaging searchDelay={600}>
        {({ data }) => (
          <WebsitesTable
            data={data}
            showActions={showActions}
            allowEdit={allowEdit}
            allowView={allowView}
            renderLink={renderLink}
            showGroupPath
          />
        )}
      </DataGrid>
    );
  }

  const { data: tree, isLoading, error } = treeQuery;

  return (
    <Column gap="3">
      <Row justifyContent="space-between" alignItems="center">
        <SearchField defaultValue={search} onSearch={handleSearch} />
      </Row>
      {isLoading && (
        <Column position="relative" minHeight="200px">
          <Loading placement="center" />
        </Column>
      )}
      {error && <Empty message={error.message} />}
      {!isLoading && !error && tree?.length === 0 && <Empty />}
      {!isLoading && !error && tree && tree.length > 0 && (
        <WebsiteTreeTable
          data={tree}
          teamId={teamId}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
          renderLink={renderLink}
          onModified={handleModified}
        />
      )}
    </Column>
  );
}
