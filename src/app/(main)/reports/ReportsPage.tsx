'use client';
import { Metadata } from 'next';
import ReportsHeader from './ReportsHeader';
import ReportsDataTable from './ReportsDataTable';

export default function ReportsPage({ teamId }: { teamId: string }) {
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
