'use client';
import { Column } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { EventsMetricsBar } from './EventsMetricsBar';

/** The controls and metrics shared by the events pages (chart, activity, properties). */
export function EventsLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <Column marginTop="3" minWidth="0" width="100%">
        {children}
      </Column>
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
