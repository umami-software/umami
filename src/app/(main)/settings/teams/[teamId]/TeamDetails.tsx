import { useContext, useState } from 'react';
import { Column, Tabs, TabList, Tab, TabPanel } from '@umami/react-zen';
import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ROLES } from '@/lib/constants';
import { Users } from '@/components/icons';
import { TeamLeaveButton } from '@/app/(main)/settings/teams/TeamLeaveButton';
import { TeamManage } from './TeamManage';
import { TeamEditForm } from './TeamEditForm';
import { TeamWebsitesDataTable } from './TeamWebsitesDataTable';
import { TeamMembersDataTable } from './TeamMembersDataTable';

export function TeamDetails({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const [tab, setTab] = useState('details');

  const isTeamOwner =
    !!team?.teamUser?.find(({ userId, role }) => role === ROLES.teamOwner && userId === user.id) &&
    user.role !== ROLES.viewOnly;

  const canEdit =
    user.isAdmin ||
    (!!team?.teamUser?.find(
      ({ userId, role }) =>
        (role === ROLES.teamOwner || role === ROLES.teamManager) && userId === user.id,
    ) &&
      user.role !== ROLES.viewOnly);

  return (
    <Column gap>
      <SectionHeader title={team?.name} icon={<Users />}>
        {!isTeamOwner && <TeamLeaveButton teamId={team.id} teamName={team.name} />}
      </SectionHeader>
      <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
        <TabList>
          <Tab id="details">{formatMessage(labels.details)}</Tab>
          <Tab id="members">{formatMessage(labels.members)}</Tab>
          <Tab id="websites">{formatMessage(labels.websites)}</Tab>
          {isTeamOwner && <Tab id="manage">{formatMessage(labels.manage)}</Tab>}
        </TabList>
        <TabPanel id="details" style={{ width: 500 }}>
          <TeamEditForm teamId={teamId} allowEdit={canEdit} />
        </TabPanel>
        <TabPanel id="members">
          <TeamMembersDataTable teamId={teamId} allowEdit />
        </TabPanel>
        <TabPanel id="websites">
          <TeamWebsitesDataTable teamId={teamId} allowEdit />
        </TabPanel>
        <TabPanel id="manage">
          <TeamManage teamId={teamId} />
        </TabPanel>
      </Tabs>
    </Column>
  );
}
