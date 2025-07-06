'use client';
import { Column } from '@umami/react-zen';
import { useLoginQuery, useMessages } from '@/components/hooks';
import { WebsitesDataTable } from './WebsitesDataTable';
import { ROLES } from '@/lib/constants';
import { SectionHeader } from '@/components/common/SectionHeader';
import { WebsiteAddButton } from './WebsiteAddButton';

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
