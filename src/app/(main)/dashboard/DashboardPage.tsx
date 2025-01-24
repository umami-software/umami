'use client';
import { Icon, Icons, Loading, Text } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import Pager from 'components/common/Pager';
import WebsiteChartList from '../websites/[websiteId]/WebsiteChartList';
import DashboardSettingsButton from 'app/(main)/dashboard/DashboardSettingsButton';
import DashboardEdit from 'app/(main)/dashboard/DashboardEdit';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import { useMessages, useLocale, useTeamUrl, useWebsites } from 'components/hooks';
import useDashboard from 'store/dashboard';
import LinkButton from 'components/common/LinkButton';

export function DashboardPage() {
  const { formatMessage, labels, messages } = useMessages();
  const { teamId, renderTeamUrl } = useTeamUrl();
  const { showCharts, editing, isEdited } = useDashboard();
  const { dir } = useLocale();
  const pageSize = isEdited ? 200 : 10;

  const { result, query, params, setParams } = useWebsites({ teamId }, { pageSize });
  const { page } = params;
  const hasData = !!result?.data?.length;

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
          <LinkButton href={renderTeamUrl('/settings')}>
            <Icon rotate={dir === 'rtl' ? 180 : 0}>
              <Icons.ArrowRight />
            </Icon>
            <Text>{formatMessage(messages.goToSettings)}</Text>
          </LinkButton>
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

export default DashboardPage;
