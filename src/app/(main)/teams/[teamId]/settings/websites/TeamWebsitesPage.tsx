'use client';
import { TeamContext } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { WebsiteAddButton } from '@/app/(main)/settings/websites/WebsiteAddButton';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { PageHeader } from '@/components/common/PageHeader';
import { TeamWebsitesDataTable } from './TeamWebsitesDataTable';
import { ROLES } from '@/lib/constants';
import { useContext } from 'react';

export function TeamWebsitesPage({ teamId }: { teamId: string }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels } = useMessages();
  const { user } = useLoginQuery();

  const canEdit =
    !!team?.teamUser?.find(
      ({ userId, role }) => userId === user.id && role !== ROLES.teamViewOnly,
    ) && user.role !== ROLES.viewOnly;

  return (
    <>
      <PageHeader title={formatMessage(labels.websites)}>
        {canEdit && <WebsiteAddButton teamId={teamId} />}
      </PageHeader>
      <TeamWebsitesDataTable teamId={teamId} allowEdit={canEdit} />
    </>
  );
}
