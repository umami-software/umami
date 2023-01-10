import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import Page from 'components/layout/Page';
import TeamEditForm from 'components/pages/settings/teams/TeamEditForm';
import PageHeader from 'components/layout/PageHeader';
import TeamMembers from 'components/pages/settings/teams/TeamMembers';

export default function TeamDetails({ teamId }) {
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get, useQuery } = useApi();
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
            <Link href="/settings/teams">Teams</Link>
          </Item>
          <Item>{values?.name}</Item>
        </Breadcrumbs>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">Details</Item>
        <Item key="members">Members</Item>
        <Item key="websites">Websites</Item>
      </Tabs>
      {tab === 'details' && <TeamEditForm teamId={teamId} data={values} onSave={handleSave} />}
      {tab === 'members' && <TeamMembers teamId={teamId} />}
    </Page>
  );
}
