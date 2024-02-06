'use client';
import { useContext, useState } from 'react';
import { Item, Tabs, Flexbox, Text, Icon } from 'react-basics';
import PageHeader from 'components/layout/PageHeader';
import { ROLES } from 'lib/constants';
import Icons from 'components/icons';
import { useLogin, useMessages } from 'components/hooks';
import TeamEditForm from './TeamEditForm';
import TeamAdmin from './TeamAdmin';
import LinkButton from 'components/common/LinkButton';
import { TeamContext } from 'app/(main)/teams/[teamId]/TeamProvider';

export function Team({ teamId }: { teamId: string }) {
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
        {!canEdit && (
          <LinkButton href={`/teams/${teamId}`}>
            <Icon>
              <Icons.Logout />
            </Icon>
            <Text>{formatMessage(labels.leaveTeam)}</Text>
          </LinkButton>
        )}
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={(value: any) => setTab(value)} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="admin">{formatMessage(labels.admin)}</Item>
      </Tabs>
      {tab === 'details' && <TeamEditForm teamId={teamId} allowEdit={canEdit} />}
      {canEdit && tab === 'admin' && <TeamAdmin teamId={teamId} />}
    </Flexbox>
  );
}

export default Team;
