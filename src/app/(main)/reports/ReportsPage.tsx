'use client';
import { Metadata } from 'next';
import { ReportsHeader } from './ReportsHeader';
import { ReportsDataTable } from './ReportsDataTable';
import { useNavigation } from '@/components/hooks';
import { PageBody } from '@/components/common/PageBody';

export function ReportsPage() {
  const { teamId } = useNavigation();

  return (
    <PageBody>
      <ReportsHeader />
      <ReportsDataTable teamId={teamId} />
    </PageBody>
  );
}

export const metadata: Metadata = {
  title: 'Reports',
};
