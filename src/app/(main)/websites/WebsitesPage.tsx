'use client';
import { WebsitesHeader } from '@/app/(main)/settings/websites/WebsitesHeader';
import { WebsitesDataTable } from '@/app/(main)/settings/websites/WebsitesDataTable';
import { useTeamUrl } from '@/components/hooks';

export function WebsitesPage() {
  const { teamId } = useTeamUrl();

  return (
    <>
      <WebsitesHeader />
      <WebsitesDataTable teamId={teamId} allowEdit={false} />
    </>
  );
}
