'use client';
import { Column } from '@umami/react-zen';
import { WebsitesDataTable } from '@/app/(main)/websites/WebsitesDataTable';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useMessages } from '@/components/hooks';

export function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  const { t, labels } = useMessages();

  return (
    <Column gap>
      <SectionHeader title={t(labels.websites)} />
      <WebsitesDataTable teamId={teamId} />
    </Column>
  );
}
