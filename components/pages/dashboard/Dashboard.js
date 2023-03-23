import { useState } from 'react';
import { Button, Icon, Icons, Text, Flexbox } from 'react-basics';
import Link from 'next/link';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteChartList from 'components/pages/websites/WebsiteChartList';
import DashboardSettingsButton from 'components/pages/dashboard/DashboardSettingsButton';
import DashboardEdit from 'components/pages/dashboard/DashboardEdit';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import useApi from 'hooks/useApi';
import useDashboard from 'store/dashboard';
import useMessages from 'hooks/useMessages';

export default function Dashboard({ userId }) {
  const { formatMessage, labels, messages } = useMessages();
  const dashboard = useDashboard();
  const { showCharts, limit, editing } = dashboard;
  const [max, setMax] = useState(limit);
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['websites'], () => get('/websites', { userId }));
  const hasData = data && data.length !== 0;

  function handleMore() {
    setMax(max + limit);
  }

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(labels.dashboard)}>
        {!editing && hasData && <DashboardSettingsButton />}
      </PageHeader>
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noWebsites)}>
          <Link href="/settings/websites">
            <Button>
              <Icon>
                <Icons.ArrowRight />
              </Icon>
              <Text>{formatMessage(messages.goToSettings)}</Text>
            </Button>
          </Link>
        </EmptyPlaceholder>
      )}
      {hasData && (
        <>
          {editing && <DashboardEdit websites={data} />}
          {!editing && <WebsiteChartList websites={data} showCharts={showCharts} limit={max} />}
          {max < data.length && (
            <Flexbox justifyContent="center">
              <Button onClick={handleMore}>
                <Icon>
                  <Icons.More />
                </Icon>
                <Text>{formatMessage(labels.more)}</Text>
              </Button>
            </Flexbox>
          )}
        </>
      )}
    </Page>
  );
}
