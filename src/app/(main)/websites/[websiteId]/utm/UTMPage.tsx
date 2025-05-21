'use client';
import { Column } from '@umami/react-zen';
import { UTMView } from './UTMView';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function UTMPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <UTMView websiteId={websiteId} />
    </Column>
  );
}
