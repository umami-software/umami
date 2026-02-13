'use client';
import { Column } from '@umami/react-zen';
import { useEffect } from 'react';
import { BoardEditBody } from '@/app/(main)/boards/[boardId]/BoardEditBody';
import { PageBody } from '@/components/common/PageBody';
import { useNavigation } from '@/components/hooks';
import { DashboardEditHeader } from './DashboardEditHeader';
import { DashboardProvider } from './DashboardProvider';

export function DashboardEditPage() {
  const { teamId, router } = useNavigation();

  useEffect(() => {
    if (teamId) {
      router.replace('/dashboard/edit');
    }
  }, [teamId, router]);

  if (teamId) {
    return null;
  }

  return (
    <DashboardProvider editing>
      <PageBody>
        <Column>
          <DashboardEditHeader />
          <BoardEditBody requiresBoardWebsite={false} />
        </Column>
      </PageBody>
    </DashboardProvider>
  );
}
