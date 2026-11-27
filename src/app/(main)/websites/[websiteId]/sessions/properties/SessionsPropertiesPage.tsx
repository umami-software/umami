'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { SessionModal } from '../SessionModal';
import { SessionProperties } from '../SessionProperties';

export function SessionsPropertiesPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <SessionProperties websiteId={websiteId} />
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
