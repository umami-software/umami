'use client';
import { Column } from '@umami/react-zen';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { useLoginQuery, useMessages, useNavigation, useTeamMembersQuery } from '@/components/hooks';
import { ROLES } from '@/lib/constants';
import { PixelAddButton } from './PixelAddButton';
import { PixelsDataTable } from './PixelsDataTable';

export function PixelsPage() {
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
        <PageHeader title={formatMessage(labels.pixels)}>
          {showActions && <PixelAddButton teamId={teamId} />}
        </PageHeader>
        <Panel>
          <PixelsDataTable showActions={showActions} />
        </Panel>
      </Column>
    </PageBody>
  );
}
