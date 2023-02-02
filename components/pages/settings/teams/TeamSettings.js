import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import Page from 'components/layout/Page';
import TeamEditForm from 'components/pages/settings/teams/TeamEditForm';
import PageHeader from 'components/layout/PageHeader';
import TeamMembers from 'components/pages/settings/teams/TeamMembers';
import { labels, messages } from 'components/messages';
import TeamWebsites from './TeamWebsites';

export default function TeamSettings({ teamId }) {
  const { formatMessage } = useIntl();
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
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
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
      <PageHeader
        title={
          <Breadcrumbs>
            <Item>
              <Link href="/settings/teams">Teams</Link>
            </Item>
            <Item>{values?.name}</Item>
          </Breadcrumbs>
        }
      />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="members">{formatMessage(labels.members)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
      </Tabs>
      {tab === 'details' && <TeamEditForm teamId={teamId} data={values} onSave={handleSave} />}
      {tab === 'members' && <TeamMembers teamId={teamId} />}
      {tab === 'websites' && <TeamWebsites teamId={teamId} />}
    </Page>
  );
}
