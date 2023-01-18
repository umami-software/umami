import { useState } from 'react';
import { Button, Loading } from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteChartList from 'components/pages/websites/WebsiteChartList';
import DashboardSettingsButton from 'components/pages/dashboard/DashboardSettingsButton';
import DashboardEdit from 'components/pages/dashboard/DashboardEdit';
import styles from 'components/pages/websites/WebsiteList.module.css';
import useUser from 'hooks/useUser';
import useApi from 'hooks/useApi';
import useDashboard from 'store/dashboard';

const messages = defineMessages({
  dashboard: { id: 'label.dashboard', defaultMessage: 'Dashboard' },
  more: { id: 'label.more', defaultMessage: 'More' },
});

export default function Dashboard({ userId }) {
  const { user } = useUser();
  const dashboard = useDashboard();
  const { showCharts, limit, editing } = dashboard;
  const [max, setMax] = useState(limit);
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['websites'], () => get('/websites', { userId }));
  const { formatMessage } = useIntl();

  function handleMore() {
    setMax(max + limit);
  }

  if (!user || isLoading) {
    return <Loading />;
  }

  if (!data) {
    return null;
  }

  return (
    <Page>
      <PageHeader>
        <div>{formatMessage(messages.dashboard)}</div>
        {!editing && <DashboardSettingsButton />}
      </PageHeader>
      {editing && <DashboardEdit websites={data} />}
      {!editing && <WebsiteChartList websites={data} showCharts={showCharts} limit={max} />}
      {max < data.length && (
        <Button className={styles.button} onClick={handleMore}>
          {formatMessage(messages.more)}
        </Button>
      )}
    </Page>
  );
}
