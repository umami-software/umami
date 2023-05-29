import { useState } from 'react';
import { Item, Tabs } from 'react-basics';
import AppLayout from 'components/layout/AppLayout';
import ReportList from 'components/pages/reports/ReportList';
import useMessages from 'hooks/useMessages';

export default function ReportsPage() {
  const [tab, setTab] = useState('create');
  const { formatMessage, labels } = useMessages();

  return (
    <AppLayout title={formatMessage(labels.reports)}>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="create">{formatMessage(labels.reports)}</Item>
        <Item key="saved">{formatMessage(labels.save)}</Item>
      </Tabs>
      {tab === 'create' && <ReportList />}
      {tab === 'saved' && <h1>My reports</h1>}
    </AppLayout>
  );
}
