'use client';
import { useState } from 'react';
import { Item, Loading, Tabs, Flexbox } from 'react-basics';
import TeamsContext from 'app/(main)/teams/TeamsContext';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import { useLogin, useTeam, useMessages } from 'components/hooks';
import TeamEditForm from './TeamEditForm';
import TeamMembers from './TeamMembers';
import TeamWebsites from './TeamWebsites';
import TeamData from './TeamData';

export function TeamSettings({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const { data: team, isLoading } = useTeam(teamId);
  const [tab, setTab] = useState('details');

  if (isLoading) {
    return <Loading position="page" />;
  }

  const canEdit = team?.teamUser?.find(
    ({ userId, role }) => role === ROLES.teamOwner && userId === user.id,
  );

  return (
    <TeamsContext.Provider value={team}>
      <Flexbox direction="column">
        <PageHeader title={team?.name} />
        <Tabs
          selectedKey={tab}
          onSelect={(value: any) => setTab(value)}
          style={{ marginBottom: 30 }}
        >
          <Item key="details">{formatMessage(labels.details)}</Item>
          <Item key="members">{formatMessage(labels.members)}</Item>
          <Item key="websites">{formatMessage(labels.websites)}</Item>
          <Item key="data">{formatMessage(labels.data)}</Item>
        </Tabs>
        {tab === 'details' && <TeamEditForm teamId={teamId} data={team} readOnly={!canEdit} />}
        {tab === 'members' && <TeamMembers teamId={teamId} readOnly={!canEdit} />}
        {tab === 'websites' && <TeamWebsites teamId={teamId} readOnly={!canEdit} />}
        {canEdit && tab === 'data' && <TeamData teamId={teamId} />}
      </Flexbox>
    </TeamsContext.Provider>
  );
}

export default TeamSettings;
