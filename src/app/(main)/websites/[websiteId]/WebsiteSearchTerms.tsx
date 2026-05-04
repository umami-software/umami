'use client';

import { Grid, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { LinkButton } from '@/components/common/LinkButton';
import {
  useMessages,
  useNavigation,
  useWebsiteGoogleAuthQuery,
  useWebsiteSearchTermsFilters,
  useWebsiteSearchTermsQuery,
} from '@/components/hooks';
import { IconLabel } from '@/components/common/IconLabel';
import { Maximize } from '@/components/icons';
import { ListTable } from '@/components/metrics/ListTable';
import type { GoogleDomain } from '@/lib/constants';

interface Props {
  websiteId: string;
  googleDomain: GoogleDomain;
}

export function WebsiteSearchTerms({ websiteId, googleDomain }: Props) {
  const { t, labels, messages } = useMessages();
  const { updateParams } = useNavigation();
  const { path, country } = useWebsiteSearchTermsFilters();

  const { data: authData, isLoading: authLoading } = useWebsiteGoogleAuthQuery(websiteId);

  const { data, isLoading, isFetching, error } = useWebsiteSearchTermsQuery(websiteId, {
    path,
    googleDomain,
    country,
    limit: 10,
    offset: 0,
    enabled: !!authData?.connected && !!authData?.propertyUrl,
  });

  const basePath = process.env.basePath || '';

  const tableData = useMemo(() => {
    if (!data?.rows?.length) return [];

    const totalClicks = data.rows.reduce((sum, r) => sum + r.clicks, 0);

    return data.rows.map(row => ({
      label: row.query,
      count: row.clicks,
      percent: totalClicks > 0 ? (row.clicks / totalClicks) * 100 : 0,
    }));
  }, [data]);

  // If GSC not connected, show prompt
  if (!authLoading && !authData?.connected) {
    return (
      <Row alignItems="center" justifyContent="center" padding="8">
        <Text color="muted" size="sm" align="center">
          {t(messages.gscNotConfiguredPrompt)}{' '}
          <LinkButton href={`${basePath}/websites/${websiteId}/settings`}>
            {t(messages.goToSettings)}
          </LinkButton>
        </Text>
      </Row>
    );
  }

  if (!authLoading && authData?.connected && !authData?.propertyUrl) {
    return (
      <Row alignItems="center" justifyContent="center" padding="8">
        <Text color="muted" size="sm" align="center">
          {t(messages.gscPropertyInstruction)}{' '}
          <LinkButton href={`${basePath}/websites/${websiteId}/settings`}>
            {t(messages.goToSettings)}
          </LinkButton>
        </Text>
      </Row>
    );
  }

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading || authLoading}
      error={error}
      minHeight="400px"
    >
      <Grid padding="2">
        {data && (
          <ListTable
            data={tableData}
            title={t(labels.searchTerms)}
            metric={t(labels.visitors)}
            metricToolTip={t(messages.visitorsGscTooltip)}
          />
        )}
        <Row justifyContent="center" alignItems="flex-end" paddingTop="4">
          <LinkButton href={updateParams({ view: 'searchTerms' })} variant="quiet">
            <IconLabel icon={<Maximize />}>{t(labels.more)}</IconLabel>
          </LinkButton>
        </Row>
      </Grid>
    </LoadingPanel>
  );
}
