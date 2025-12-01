'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getItem, removeItem } from '@/lib/storage';
import { LAST_TEAM_CONFIG } from '@/lib/constants';

export default function RootPage() {
  useEffect(() => {
    const lastTeam = getItem(LAST_TEAM_CONFIG);

    if (lastTeam) {
      redirect(`/teams/${lastTeam}/websites`);
    } else {
      removeItem(LAST_TEAM_CONFIG);

      redirect(`/websites`);
    }
  }, []);

  return null;
}
