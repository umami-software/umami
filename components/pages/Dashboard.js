import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import WebsiteList from 'components/pages/WebsiteList';
import Button from 'components/common/Button';
import DashboardSettingsButton from 'components/settings/DashboardSettingsButton';
import useFetch from 'hooks/useFetch';
import useDashboard from 'store/dashboard';
import DashboardEdit from './DashboardEdit';
import styles from './WebsiteList.module.css';

const messages = defineMessages({
  dashboard: { id: 'label.dashboard', defaultMessage: 'Dashboard' },
  more: { id: 'label.more', defaultMessage: 'More' },
});

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;
  const userId = id?.[0];
  const dashboard = useDashboard();
  const { showCharts, limit, editing } = dashboard;
  const [max, setMax] = useState(limit);
  const { data } = useFetch('/websites', { params: { user_id: userId } });
  const { formatMessage } = useIntl();

  function handleMore() {
    setMax(max + limit);
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
      {!editing && <WebsiteList websites={data} showCharts={showCharts} limit={max} />}
      {max < data.length && (
        <Button className={styles.button} onClick={handleMore}>
          {formatMessage(messages.more)}
        </Button>
      )}
    </Page>
  );
}
