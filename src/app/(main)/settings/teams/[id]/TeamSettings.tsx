'use client';
import { useEffect, useState } from 'react';
import { Item, Loading, Tabs, useToasts, Flexbox } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import { useUser } from 'components/hooks';
import { useApi } from 'components/hooks';
import { useMessages } from 'components/hooks';
import TeamEditForm from './TeamEditForm';
import TeamMembers from './TeamMembers';
import TeamWebsites from './TeamWebsites';
import TeamData from './TeamData';

export function TeamSettings({ teamId }: { teamId: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get, useQuery } = useApi();
  const { showToast } = useToasts();
  const { data, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => {
      if (teamId) {
        return get(`/teams/${teamId}`);
      }
    },
  });
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

  if (isLoading || !values) {
    return <Loading />;
  }

  return (
    <Flexbox direction="column">
      <PageHeader title={values?.name} />
      <Tabs selectedKey={tab} onSelect={(value: any) => setTab(value)} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="members">{formatMessage(labels.members)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
        <Item key="data">{formatMessage(labels.data)}</Item>
      </Tabs>
      {tab === 'details' && (
        <TeamEditForm teamId={teamId} data={values} onSave={handleSave} readOnly={!canEdit} />
      )}
      {tab === 'members' && <TeamMembers teamId={teamId} readOnly={!canEdit} />}
      {tab === 'websites' && <TeamWebsites teamId={teamId} readOnly={!canEdit} />}
      {canEdit && tab === 'data' && <TeamData teamId={teamId} />}
    </Flexbox>
  );
}

export default TeamSettings;
