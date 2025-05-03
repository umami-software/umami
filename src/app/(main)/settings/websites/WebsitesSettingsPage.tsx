'use client';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { WebsitesDataTable } from './WebsitesDataTable';
import { ROLES } from '@/lib/constants';
import { WebsiteAddButton } from '@/app/(main)/settings/websites/WebsiteAddButton';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Column } from '@umami/react-zen';

export function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  const { user } = useLoginQuery();
  const canCreate = user.role !== ROLES.viewOnly;
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.websites)}>
        {canCreate && <WebsiteAddButton teamId={teamId} />}
      </SectionHeader>
      <WebsitesDataTable teamId={teamId} />
    </Column>
  );
}
