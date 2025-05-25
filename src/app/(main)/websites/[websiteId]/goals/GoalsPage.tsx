'use client';
import { Column } from '@umami/react-zen';
import { SectionHeader } from '@/components/common/SectionHeader';
import { GoalAddButton } from './GoalAddButton';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function GoalsPage({ websiteId }: { websiteId: string }) {
  return (
    <Column>
      <WebsiteControls websiteId={websiteId} />
      <SectionHeader>
        <GoalAddButton websiteId={websiteId} />
      </SectionHeader>
    </Column>
  );
}
