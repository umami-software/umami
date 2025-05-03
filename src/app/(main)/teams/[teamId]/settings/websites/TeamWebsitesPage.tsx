'use client';
import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { WebsiteAddButton } from '@/app/(main)/settings/websites/WebsiteAddButton';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { SectionHeader } from '@/components/common/SectionHeader';
import { TeamWebsitesDataTable } from './TeamWebsitesDataTable';
import { ROLES } from '@/lib/constants';
import { useContext } from 'react';
import { Column } from '@umami/react-zen';

export function TeamWebsitesPage({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();

  const canEdit =
    !!team?.teamUser?.find(
      ({ userId, role }) => userId === user.id && role !== ROLES.teamViewOnly,
    ) && user.role !== ROLES.viewOnly;

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.websites)}>
        {canEdit && <WebsiteAddButton teamId={teamId} />}
      </SectionHeader>
      <TeamWebsitesDataTable teamId={teamId} allowEdit={canEdit} />
    </Column>
  );
}
