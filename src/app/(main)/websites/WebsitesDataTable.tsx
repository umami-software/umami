import { Icon, ListItem, Row, Select, Text } from '@umami/react-zen';
import Link from 'next/link';
import { DataGrid } from '@/components/common/DataGrid';
import {
  useLoginQuery,
  useMessages,
  useNavigation,
  useTimezone,
  useUserWebsitesQuery,
} from '@/components/hooks';
import { Favicon } from '@/index';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { WebsitesTable } from './WebsitesTable';

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const SORT_OPTIONS = [
  {
    id: 'visitors',
    orderBy: 'visitors',
    sortDescending: true,
  },
  {
    id: 'pageviews',
    orderBy: 'pageviews',
    sortDescending: true,
  },
  {
    id: 'name',
    orderBy: 'name',
    sortDescending: false,
  },
  {
    id: 'domain',
    orderBy: 'domain',
    sortDescending: false,
  },
] as const;
const DEFAULT_SORT_ID = 'visitors';
const DEFAULT_SORT = SORT_OPTIONS.find(option => option.id === DEFAULT_SORT_ID) || SORT_OPTIONS[0];

function getSortById(id?: string) {
  return SORT_OPTIONS.find(option => option.id === id) || DEFAULT_SORT;
}

function getSelectedSort(orderBy?: string, sortDescending?: boolean | string) {
  const isDescending = sortDescending === true || sortDescending === 'true';

  return (
    SORT_OPTIONS.find(
      option => option.orderBy === orderBy && option.sortDescending === isDescending,
    ) || DEFAULT_SORT
  );
}

export function WebsitesDataTable({
  userId,
  teamId,
  allowEdit = true,
  allowView = true,
  showActions = true,
  showStats = false,
}: {
  userId?: string;
  teamId?: string;
  allowEdit?: boolean;
  allowView?: boolean;
  showActions?: boolean;
  showStats?: boolean;
}) {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { renderUrl, router, query, updateParams } = useNavigation();
  const { timezone, canonicalizeTimezone } = useTimezone();
  const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
  const selectedSort = getSelectedSort(query.orderBy, query.sortDescending);
  const queryResult = useUserWebsitesQuery(
    { userId: userId || user?.id, teamId },
    {
      pageSize,
      orderBy: selectedSort.orderBy,
      sortDescending: selectedSort.sortDescending,
      timezone: canonicalizeTimezone(timezone),
      includeMetrics: showStats || undefined,
    },
  );

  const renderLink = (row: any) => (
    <Row alignItems="center" gap="3">
      <Icon size="md" color="muted">
        <Favicon domain={row.domain} />
      </Icon>
      <Text truncate>
        <Link href={renderUrl(`/websites/${row.id}`, false)}>{row.name}</Link>
      </Text>
    </Row>
  );

  const handlePageSizeChange = (value: string) => {
    router.push(updateParams({ page: 1, pageSize: value }));
  };

  const handleSortChange = (value: string) => {
    const sort = getSortById(value);
    const isDefault = sort.id === DEFAULT_SORT_ID;

    router.push(
      updateParams({
        page: 1,
        orderBy: isDefault ? undefined : sort.orderBy,
        sortDescending: isDefault ? undefined : sort.sortDescending ? 'true' : 'false',
      }),
    );
  };

  const renderActions = () => (
    <Row alignItems="center" gap="3" wrap="wrap">
      <Row alignItems="center" gap="2">
        <Text size="sm" color="muted">
          {t(labels.sortBy)}
        </Text>
        <Select
          value={selectedSort.id}
          onChange={handleSortChange}
          style={{ width: 220 }}
          popoverProps={{ placement: 'bottom right' }}
        >
          <ListItem id="visitors">{t(labels.mostVisitorsToday)}</ListItem>
          <ListItem id="pageviews">{t(labels.mostViewsToday)}</ListItem>
          <ListItem id="name">{`${t(labels.name)} (A-Z)`}</ListItem>
          <ListItem id="domain">{`${t(labels.domain)} (A-Z)`}</ListItem>
        </Select>
      </Row>
      <Row alignItems="center" gap="2">
        <Text size="sm" color="muted">
          {t(labels.resultsPerPage)}
        </Text>
        <Select
          value={pageSize.toString()}
          onChange={handlePageSizeChange}
          style={{ width: 120 }}
          popoverProps={{ placement: 'bottom right' }}
        >
          {PAGE_SIZE_OPTIONS.map(value => (
            <ListItem key={value} id={value.toString()}>
              {value.toLocaleString()}
            </ListItem>
          ))}
        </Select>
      </Row>
    </Row>
  );

  return (
    <DataGrid query={queryResult} allowSearch allowPaging renderActions={renderActions}>
      {({ data }) => (
        <WebsitesTable
          data={data}
          showActions={showActions}
          allowEdit={allowEdit}
          allowView={allowView}
          showStats={showStats}
          renderLink={renderLink}
        />
      )}
    </DataGrid>
  );
}
