'use client';
import { Column } from '@umami/react-zen';
import { LinksDataTable } from '@/app/(main)/links/LinksDataTable';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLoginQuery, useMessages, useNavigation, useTeamMembersQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { LinkAddButton } from './LinkAddButton';

export function LinksPage() {
  const { user } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const { teamId } = useNavigation();
  const { data } = useTeamMembersQuery(teamId);

  const showActions =
    (teamId &&
      data?.data.filter(team => team.userId === user.id && team.role !== ROLES.teamViewOnly)
        .length > 0) ||
    (!teamId && user.role !== ROLES.viewOnly);

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.links)}>
          {showActions && <LinkAddButton teamId={teamId} />}
        </PageHeader>
        <Panel>
          <LinksDataTable showActions={showActions} />
        </Panel>
      </Column>
    </PageBody>
  );
}
