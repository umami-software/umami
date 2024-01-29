'use client';
import { useContext } from 'react';
import TeamsContext from 'app/(main)/teams/TeamsContext';
import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';

export default function TeamWebsites() {
  const team = useContext(TeamsContext);

  if (!team) {
    return null;
  }

  return <WebsitesDataTable teamId={team.id} />;
}
