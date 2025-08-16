import { useContext, useState } from 'react';
import { Column, Tabs, TabList, Tab, TabPanel } from '@umami/react-zen';
import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { useLoginQuery, useMessages, useNavigation } from '@/components/hooks';

import { ROLES } from '@/lib/constants';
import { Users } from '@/components/icons';
import { TeamLeaveButton } from '@/app/(main)/teams/TeamLeaveButton';
import { TeamManage } from './TeamManage';
import { TeamEditForm } from './TeamEditForm';
import { TeamWebsitesDataTable } from './TeamWebsitesDataTable';
import { TeamMembersDataTable } from './TeamMembersDataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function TeamSettings({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const { query, pathname } = useNavigation();
  const [tab, setTab] = useState(query?.tab || 'details');

  const isAdmin = pathname.includes('/admin');

  const isTeamOwner =
    !!team?.members?.find(({ userId, role }) => role === ROLES.teamOwner && userId === user.id) &&
    user.role !== ROLES.viewOnly;

  const canEdit =
    user.isAdmin ||
    (!!team?.members?.find(
      ({ userId, role }) =>
        (role === ROLES.teamOwner || role === ROLES.teamManager) && userId === user.id,
    ) &&
      user.role !== ROLES.viewOnly);

  return (
    <Column gap="6">
      <PageHeader title={team?.name} icon={<Users />}>
        {!isTeamOwner && !isAdmin && <TeamLeaveButton teamId={team.id} teamName={team.name} />}
      </PageHeader>
      <Panel>
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
      </Panel>
    </Column>
  );
}
