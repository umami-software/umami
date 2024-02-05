'use client';
import { useContext, useState } from 'react';
import { Item, Tabs, Flexbox, Text, Icon } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import Icons from 'components/icons';
import { useLogin, useMessages } from 'components/hooks';
import TeamEditForm from './TeamEditForm';
import TeamMembers from './TeamMembers';
import TeamWebsites from './TeamWebsites';
import TeamData from './TeamData';
import LinkButton from 'components/common/LinkButton';
import { TeamContext } from 'app/(main)/teams/[teamId]/TeamProvider';

export function TeamSettings({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLogin();
  const [tab, setTab] = useState('details');

  const canEdit = team?.teamUser?.find(
    ({ userId, role }) => role === ROLES.teamOwner && userId === user.id,
  );

  return (
    <Flexbox direction="column">
      <PageHeader title={team?.name} icon={<Icons.Users />}>
        <LinkButton href={`/teams/${teamId}`} variant="primary">
          <Icon>
            <Icons.Change />
          </Icon>
          <Text>{formatMessage(labels.view)}</Text>
        </LinkButton>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={(value: any) => setTab(value)} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="members">{formatMessage(labels.members)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
        <Item key="data">{formatMessage(labels.data)}</Item>
      </Tabs>
      {tab === 'details' && <TeamEditForm teamId={teamId} allowEdit={canEdit} />}
      {tab === 'members' && <TeamMembers teamId={teamId} allowEdit={canEdit} />}
      {tab === 'websites' && <TeamWebsites teamId={teamId} allowEdit={canEdit} />}
      {canEdit && tab === 'data' && <TeamData teamId={teamId} />}
    </Flexbox>
  );
}

export default TeamSettings;
