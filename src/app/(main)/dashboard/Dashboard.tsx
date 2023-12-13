'use client';
import { Button, Icon, Icons, Loading, Text } from 'react-basics';
import Link from 'next/link';
import PageHeader from 'components/layout/PageHeader';
import Pager from 'components/common/Pager';
import WebsiteChartList from '../../(main)/websites/[id]/WebsiteChartList';
import DashboardSettingsButton from 'app/(main)/dashboard/DashboardSettingsButton';
import DashboardEdit from 'app/(main)/dashboard/DashboardEdit';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useApi from 'components/hooks/useApi';
import useDashboard from 'store/dashboard';
import useMessages from 'components/hooks/useMessages';
import useLocale from 'components/hooks/useLocale';
import useFilterQuery from 'components/hooks/useFilterQuery';
import { useUser } from 'components/hooks';

export function Dashboard() {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { showCharts, editing } = useDashboard();
  const { dir } = useLocale();
  const { get } = useApi();
  const pageSize = 10;

  const { query, params, setParams, result } = useFilterQuery({
    queryKey: ['dashboard:websites'],
    queryFn: (params: any) => {
      return get(`/users/${user.id}/websites`, { ...params, includeTeams: true, pageSize });
    },
  });

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  const { data, count } = result || {};
  const hasData = !!(data as any)?.length;
  const { page } = params;

  if (query.isLoading) {
    return <Loading />;
  }

  return (
    <>
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
    </>
  );
}

export default Dashboard;
