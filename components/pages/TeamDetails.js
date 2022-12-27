import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';
import { useQuery } from '@tanstack/react-query';
import { useApi } from 'next-basics';
import Link from 'next/link';
import Page from 'components/layout/Page';
import TeamEditForm from 'components/forms/TeamEditForm';
import PageHeader from 'components/layout/PageHeader';
import { getAuthToken } from 'lib/client';
import TeamMembersTable from '../tables/TeamMembersTable';

export default function TeamDetails({ teamId }) {
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('general');
  const { get } = useApi(getAuthToken());
  const { toast, showToast } = useToast();
  const { data, isLoading } = useQuery(
    ['team', teamId],
    () => {
      if (teamId) {
        return get(`/teams/${teamId}`);
      }
    },
    { cacheTime: 0 },
  );

  const handleSave = data => {
    showToast({ message: 'Saved successfully.', variant: 'success' });
    setValues(state => ({ ...state, ...data }));
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  return (
    <Page loading={isLoading || !values}>
      {toast}
      <PageHeader>
        <Breadcrumbs>
          <Item>
            <Link href="/teams">Teams</Link>
          </Item>
          <Item>{values?.name}</Item>
        </Breadcrumbs>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="general">General</Item>
        <Item key="members">Members</Item>
        <Item key="websites">Websites</Item>
      </Tabs>
      {tab === 'general' && <TeamEditForm teamId={teamId} data={values} onSave={handleSave} />}
      {tab === 'members' && <TeamMembersTable teamId={teamId} />}
    </Page>
  );
}
