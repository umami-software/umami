'use client';
import { Button, Column, Icon, ListItem, Row, Select } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLoginQuery, useMessages, useNavigation, useTeamMembersQuery } from '@/components/hooks';
import type { SortField } from '@/components/hooks/queries/useAllWebsiteStatsQuery';
import type { OverviewRange } from '@/components/hooks/queries/useWebsiteSummaryQuery';
import { ArrowUpDown, LayoutGrid, List } from '@/components/icons';
import { FilterButtons } from '@/components/input/FilterButtons';
import { ROLES } from '@/lib/constants';
import { getItem, setItem } from '@/lib/storage';
import { WebsiteAddButton } from './WebsiteAddButton';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsitesOverview } from './WebsitesOverview';

const VIEW_KEY = 'umami.websites-view';
const RANGE_KEY = 'umami.websites-range';
const SORT_KEY = 'umami.websites-sort';

const RANGES: { value: OverviewRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
];

export function WebsitesPage() {
  const { user } = useLoginQuery();
  const { teamId } = useNavigation();
  const { t, labels } = useMessages();
  const { data } = useTeamMembersQuery(teamId);

  const showActions =
    (teamId &&
      data?.data.filter(team => team.userId === user.id && team.role !== ROLES.teamViewOnly)
        .length > 0) ||
    (!teamId && user.role !== ROLES.viewOnly);

  const sorts = useMemo<{ value: SortField; label: string }[]>(
    () => [
      { value: 'name', label: t(labels.name) },
      { value: 'visitors', label: t(labels.visitors) },
      { value: 'pageviews', label: t(labels.views) },
    ],
    [t, labels],
  );
  const [view, setView] = useState<'grid' | 'list'>(() => getItem(VIEW_KEY) ?? 'grid');
  const [range, setRange] = useState<OverviewRange>(() => getItem(RANGE_KEY) ?? '24h');
  const [sort, setSort] = useState<SortField>(() => getItem(SORT_KEY) ?? 'name');

  const handleViewChange = (next: 'grid' | 'list') => {
    setView(next);
    setItem(VIEW_KEY, next);
  };

  const handleRangeChange = (next: OverviewRange) => {
    setRange(next);
    setItem(RANGE_KEY, next);
  };

  const handleSortChange = (next: SortField) => {
    setSort(next);
    setItem(SORT_KEY, next);
  };

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={t(labels.websites)}>
          <Row gap="2" alignItems="center">
            {view === 'grid' && (
              <>
                <Row gap="1" alignItems="center">
                  <Icon size="sm" style={{ color: 'var(--text-500)' }}>
                    <ArrowUpDown />
                  </Icon>
                  <Select
                    aria-label={t(labels.sort)}
                    value={sort}
                    onChange={(value: string) => handleSortChange(value as SortField)}
                  >
                    {sorts.map(s => (
                      <ListItem key={s.value} id={s.value}>
                        {s.label}
                      </ListItem>
                    ))}
                  </Select>
                </Row>

                <FilterButtons
                  items={RANGES.map(r => ({ id: r.value, label: r.label }))}
                  value={range}
                  onChange={value => handleRangeChange(value as OverviewRange)}
                />
              </>
            )}

            <Button
              variant={view === 'grid' ? 'primary' : 'quiet'}
              size="sm"
              onPress={() => handleViewChange('grid')}
              aria-label="Grid view"
            >
              <Icon size="sm">
                <LayoutGrid />
              </Icon>
            </Button>
            <Button
              variant={view === 'list' ? 'primary' : 'quiet'}
              size="sm"
              onPress={() => handleViewChange('list')}
              aria-label="List view"
            >
              <Icon size="sm">
                <List />
              </Icon>
            </Button>

            {showActions && <WebsiteAddButton teamId={teamId} />}
          </Row>
        </PageHeader>

        {view === 'grid' ? (
          <WebsitesOverview teamId={teamId} range={range} sort={sort} />
        ) : (
          <Panel>
            <WebsitesDataTable teamId={teamId} showActions={showActions} />
          </Panel>
        )}
      </Column>
    </PageBody>
  );
}
