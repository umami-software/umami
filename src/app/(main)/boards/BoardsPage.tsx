'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLoginQuery, useMessages, useNavigation, useTeamMembersQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { BoardAddButton } from './BoardAddButton';
import { BoardsDataTable } from './BoardsDataTable';

export function BoardsPage() {
  const { user } = useLoginQuery();
  const { t, labels } = useMessages();
  const { teamId } = useNavigation();
  const { data } = useTeamMembersQuery(teamId);

  const canCreate =
    user.role !== ROLES.viewOnly &&
    (!teamId ||
      data?.data.filter(team => team.userId === user.id && team.role !== ROLES.teamViewOnly)
        .length > 0);

  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title={t(labels.boards)}>{canCreate && <BoardAddButton />}</PageHeader>
        <Panel>
          <BoardsDataTable />
        </Panel>
      </Column>
    </PageBody>
  );
}
