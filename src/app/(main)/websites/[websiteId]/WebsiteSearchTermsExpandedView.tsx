'use client';

import {
  Button,
  Column,
  DataColumn,
  DataTable,
  Icon,
  Row,
  SearchField,
  Text,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useMessages,
  useWebsiteGoogleAuthQuery,
  useWebsiteSearchTermsFilters,
  useWebsiteSearchTermsQuery,
} from '@/components/hooks';
import { X } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { formatLongNumber } from '@/lib/format';
import type { GoogleDomain } from '@/lib/constants';

interface Props {
  websiteId: string;
  googleDomain?: GoogleDomain;
  onClose?: () => void;
}

export function WebsiteSearchTermsExpandedView({ websiteId, googleDomain, onClose }: Props) {
  const { t, labels } = useMessages();
  const { path, country } = useWebsiteSearchTermsFilters();
  const [search, setSearch] = useState('');

  const { data: authData } = useWebsiteGoogleAuthQuery(websiteId);

  const { data, isLoading, isFetching, error } = useWebsiteSearchTermsQuery(websiteId, {
    path,
    googleDomain,
    country,
    limit: 500,
    offset: 0,
    enabled: !!authData?.connected && !!authData?.propertyUrl,
  });

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    const totalClicks = data.rows.reduce((sum, r) => sum + r.clicks, 0);
    return data.rows
      .filter(r => !search || r.query.toLowerCase().includes(search.toLowerCase()))
      .map(r => ({
        ...r,
        percent: totalClicks > 0 ? (r.clicks / totalClicks) * 100 : 0,
      }));
  }, [data, search]);

  const downloadData = useMemo(
    () =>
      data?.rows?.map(r => ({
        query: r.query,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: `${(r.ctr * 100).toFixed(1)}%`,
        position: r.position.toFixed(1),
      })),
    [data],
  );

  return (
    <>
      <Row alignItems="center" paddingBottom="3">
        <SearchField value={search} onSearch={setSearch} delay={200} />
        <Row justifyContent="flex-end" flexGrow={1} gap>
          {downloadData && <DownloadButton filename="search-terms" data={downloadData} />}
          {onClose && (
            <Button onPress={onClose} variant="quiet">
              <Icon>
                <X />
              </Icon>
            </Button>
          )}
        </Row>
      </Row>
      <LoadingPanel
        data={data}
        isFetching={isFetching}
        isLoading={isLoading}
        error={error}
        height="100%"
        loadingIcon="spinner"
      >
        <Column overflow="auto" minHeight="0" height="100%" paddingRight="3">
          {filteredRows.length > 0 && (
            <DataTable data={filteredRows}>
              <DataColumn
                id="query"
                label={t(labels.searchTerms)}
                width="minmax(200px, 2fr)"
                align="start"
              >
                {row => <Text truncate>{row.query}</Text>}
              </DataColumn>
              <DataColumn id="clicks" label={t(labels.visitors)} align="end" width="100px">
                {row => formatLongNumber(row.clicks)}
              </DataColumn>
              <DataColumn id="impressions" label={t(labels.impressions)} align="end" width="120px">
                {row => formatLongNumber(row.impressions)}
              </DataColumn>
              <DataColumn id="ctr" label={t(labels.ctr)} align="end" width="80px">
                {row => `${(row.ctr * 100).toFixed(1)}%`}
              </DataColumn>
              <DataColumn id="position" label={t(labels.position)} align="end" width="90px">
                {row => row.position.toFixed(1)}
              </DataColumn>
            </DataTable>
          )}
          {filteredRows.length === 0 && !isLoading && (
            <Row justifyContent="center" padding="8">
              <Text color="muted">{t(labels.none)}</Text>
            </Row>
          )}
        </Column>
      </LoadingPanel>
    </>
  );
}
