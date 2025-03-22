'use client';
import { useLoginQuery } from '@/components/hooks';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsitesHeader } from './WebsitesHeader';
import { ROLES } from '@/lib/constants';

export function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  const { user } = useLoginQuery();
  const canCreate = user.role !== ROLES.viewOnly;

  return (
    <>
      <WebsitesHeader allowCreate={canCreate} />
      <WebsitesDataTable teamId={teamId} />
    </>
  );
}
