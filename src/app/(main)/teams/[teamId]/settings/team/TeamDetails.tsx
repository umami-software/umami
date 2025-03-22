import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROLES } from '@/lib/constants';
import { useContext, useState } from 'react';
import { Column, Tabs, TabList, Tab, TabPanel } from '@umami/react-zen';
import { TeamLeaveButton } from '@/app/(main)/settings/teams/TeamLeaveButton';
import { TeamManage } from './TeamManage';
import { TeamEditForm } from './TeamEditForm';
import { Panel } from '@/components/layout/Panel';

export function TeamDetails({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();
  const [tab, setTab] = useState('details');

  const isTeamOwner =
    !!team?.teamUser?.find(({ userId, role }) => role === ROLES.teamOwner && userId === user.id) &&
    user.role !== ROLES.viewOnly;

  const canEdit =
    !!team?.teamUser?.find(
      ({ userId, role }) =>
        (role === ROLES.teamOwner || role === ROLES.teamManager) && userId === user.id,
    ) && user.role !== ROLES.viewOnly;

  return (
    <Column>
      <PageHeader title={team?.name} icon={<Icons.Users />}>
        {!isTeamOwner && <TeamLeaveButton teamId={team.id} teamName={team.name} />}
      </PageHeader>
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
          <TabList>
            <Tab id="details">{formatMessage(labels.details)}</Tab>
            {isTeamOwner && <Tab id="manage">{formatMessage(labels.manage)}</Tab>}
          </TabList>
          <TabPanel id="details">
            <TeamEditForm teamId={teamId} allowEdit={canEdit} />
          </TabPanel>
          <TabPanel id="manage">
            <TeamManage teamId={teamId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Column>
  );
}
