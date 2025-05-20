'use client';
import { Column } from '@umami/react-zen';

export function GoalsPage({ websiteId }: { websiteId: string }) {
  return <Column>Goals {websiteId}</Column>;
}
