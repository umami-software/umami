import { useState } from 'react';
import { Button, Loading } from 'react-basics';
import { defineMessages, useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteChartList from 'components/pages/websites/WebsiteChartList';
import DashboardSettingsButton from 'components/settings/DashboardSettingsButton';
import useApi from 'hooks/useApi';
import useRequireLogin from 'hooks/useRequireLogin';
import useDashboard from 'store/dashboard';
import DashboardEdit from './DashboardEdit';
import styles from '../websites/WebsiteList.module.css';

const messages = defineMessages({
  dashboard: { id: 'label.dashboard', defaultMessage: 'Dashboard' },
  more: { id: 'label.more', defaultMessage: 'More' },
});

export default function Dashboard({ userId }) {
  const { user } = useRequireLogin();
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
