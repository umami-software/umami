'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { getItem } from '@/lib/storage';

export default function RootPage() {
  useEffect(() => {
    const lastTeam = getItem(LAST_TEAM_CONFIG);

    if (lastTeam) {
      redirect(`/teams/${lastTeam}/websites`);
    } else {
      redirect(`/websites`);
    }
  }, []);

  return null;
}
