'use client';
import { Button, Icon, Icons, Loading, Text } from 'react-basics';
import Link from 'next/link';
import PageHeader from 'components/layout/PageHeader';
import Pager from 'components/common/Pager';
import WebsiteChartList from '../websites/[websiteId]/WebsiteChartList';
import DashboardSettingsButton from 'app/(main)/dashboard/DashboardSettingsButton';
import DashboardEdit from 'app/(main)/dashboard/DashboardEdit';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { useMessages, useLocale, useTeamContext, useWebsites } from 'components/hooks';
import useDashboard from 'store/dashboard';

export function Dashboard() {
  const { formatMessage, labels, messages } = useMessages();
  const { teamId } = useTeamContext();
  const { showCharts, editing } = useDashboard();
  const { dir } = useLocale();
  const pageSize = 10;

  const { result, query, params, setParams } = useWebsites({}, { pageSize });
  const { page } = params;
  const hasData = !!result?.data;

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  if (query.isLoading) {
    return <Loading />;
  }

  return (
    <section style={{ marginBottom: 60 }}>
      <PageHeader title={formatMessage(labels.dashboard)}>
        {!editing && hasData && <DashboardSettingsButton />}
      </PageHeader>
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsitesConfigured)}>
          <Link href="/settings/websites">
            <Button>
              <Icon rotate={dir === 'rtl' ? 180 : 0}>
                <Icons.ArrowRight />
              </Icon>
              <Text>{formatMessage(messages.goToSettings)}</Text>
            </Button>
          </Link>
        </EmptyPlaceholder>
      )}
      {hasData && (
        <>
          {editing && <DashboardEdit teamId={teamId} />}
          {!editing && (
            <>
              <WebsiteChartList
                websites={result?.data as any}
                showCharts={showCharts}
                limit={pageSize}
              />
              <Pager
                page={page}
                pageSize={pageSize}
                count={result?.count}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Dashboard;
