import { useEffect, useState } from 'react';
import { Item, Tabs, useToasts } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import useUser from 'components/hooks/useUser';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import TeamEditForm from './TeamEditForm';
import TeamMembers from './TeamMembers';
import TeamWebsites from './TeamWebsites';

export function TeamSettings({ teamId }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get, useQuery } = useApi();
  const { showToast } = useToasts();
  const { data, isLoading } = useQuery(
    ['team', teamId],
    () => {
      if (teamId) {
        return get(`/teams/${teamId}`);
      }
    },
    { cacheTime: 0 },
  );
  const canEdit = data?.teamUser?.find(
    ({ userId, role }) => role === ROLES.teamOwner && userId === user.id,
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
      <PageHeader title={values?.name} />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="members">{formatMessage(labels.members)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
      </Tabs>
      {tab === 'details' && (
        <TeamEditForm teamId={teamId} data={values} onSave={handleSave} readOnly={!canEdit} />
      )}
      {tab === 'members' && <TeamMembers teamId={teamId} readOnly={!canEdit} />}
      {tab === 'websites' && <TeamWebsites teamId={teamId} readOnly={!canEdit} />}
    </Page>
  );
}

export default TeamSettings;
