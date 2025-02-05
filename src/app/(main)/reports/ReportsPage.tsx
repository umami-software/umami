'use client';
import { Metadata } from 'next';
import ReportsHeader from './ReportsHeader';
import ReportsDataTable from './ReportsDataTable';
import { useTeamUrl } from '@/components/hooks';

export default function ReportsPage() {
  const { teamId } = useTeamUrl();

  return (
    <>
      <ReportsHeader />
      <ReportsDataTable teamId={teamId} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Reports',
};
