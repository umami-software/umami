'use client';
import WebsitesDataTable from '../settings/websites/WebsitesDataTable';

export function Websites({ teamId, userId }: { teamId: string; userId: string }) {
  return <WebsitesDataTable teamId={teamId} userId={userId} allowEdit={false} />;
}

export default Websites;
