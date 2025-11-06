import { Column } from '@umami/react-zen';
import { useLoginQuery, useNavigation, useTeam } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { Users } from '@/components/icons';
import { TeamLeaveButton } from '@/app/(main)/teams/TeamLeaveButton';
import { TeamManage } from './TeamManage';
import { TeamEditForm } from './TeamEditForm';
import { TeamMembersDataTable } from './TeamMembersDataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';

export function TeamSettings({ teamId }: { teamId: string }) {
  const team: any = useTeam();
  const { user } = useLoginQuery();
  const { pathname } = useNavigation();

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
        <TeamEditForm teamId={teamId} allowEdit={canEdit} showAccessCode={canEdit} />
      </Panel>
      <Panel>
        <TeamMembersDataTable teamId={teamId} allowEdit={canEdit} />
      </Panel>
      {isTeamOwner && (
        <Panel>
          <TeamManage teamId={teamId} />
        </Panel>
      )}
    </Column>
  );
}
