'use client';
import { WebsitesHeader } from '@/app/(main)/settings/websites/WebsitesHeader';
import { WebsitesDataTable } from '@/app/(main)/settings/websites/WebsitesDataTable';
import { useNavigation } from '@/components/hooks';

export function WebsitesPage() {
  const { teamId } = useNavigation();

  return (
    <>
      <WebsitesHeader />
      <WebsitesDataTable teamId={teamId} allowEdit={false} />
    </>
  );
}
