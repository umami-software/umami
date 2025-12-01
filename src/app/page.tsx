'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { getItem, removeItem } from '@/lib/storage';

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
