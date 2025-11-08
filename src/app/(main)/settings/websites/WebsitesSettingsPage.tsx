'use client';
import { Column } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { WebsitesDataTable } from '@/app/(main)/websites/WebsitesDataTable';
import { SectionHeader } from '@/components/common/SectionHeader';

export function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={formatMessage(labels.websites)} />
      <WebsitesDataTable teamId={teamId} />
    </Column>
  );
}
