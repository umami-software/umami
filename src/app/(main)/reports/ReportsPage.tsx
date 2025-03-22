'use client';
import { Metadata } from 'next';
import { ReportsHeader } from './ReportsHeader';
import { ReportsDataTable } from './ReportsDataTable';
import { useNavigation } from '@/components/hooks';

export function ReportsPage() {
  const { teamId } = useNavigation();

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
