import { Button, Icon, Icons, Text } from 'react-basics';
import Link from 'next/link';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import Pager from 'components/common/Pager';
import WebsiteChartList from 'components/pages/websites/WebsiteChartList';
import DashboardSettingsButton from 'components/pages/dashboard/DashboardSettingsButton';
import DashboardEdit from 'components/pages/dashboard/DashboardEdit';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useApi from 'components/hooks/useApi';
import useDashboard from 'store/dashboard';
import useMessages from 'components/hooks/useMessages';
import useLocale from 'components/hooks/useLocale';
import useApiFilter from 'components/hooks/useApiFilter';

export function Dashboard() {
  const { formatMessage, labels, messages } = useMessages();
  const { showCharts, editing } = useDashboard();
  const { dir } = useLocale();
  const { get, useQuery } = useApi();
  const { page, handlePageChange } = useApiFilter();
  const pageSize = 10;
  const {
    data: result,
    isLoading,
    error,
  } = useQuery(['websites', page, pageSize], () =>
    get('/websites', { includeTeams: 1, page, pageSize }),
  );
  const { data, count } = result || {};
  const hasData = data && data?.length !== 0;

  return (
    <Page loading={isLoading} error={error}>
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
          {editing && <DashboardEdit />}
          {!editing && (
            <>
              <WebsiteChartList websites={data} showCharts={showCharts} limit={pageSize} />
              <Pager
                page={page}
                pageSize={pageSize}
                count={count}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </Page>
  );
}

export default Dashboard;
