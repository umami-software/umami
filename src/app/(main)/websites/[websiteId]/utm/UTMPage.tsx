'use client';
import { Column } from '@umami/react-zen';

export function UTMPage({ websiteId }: { websiteId: string }) {
  return <Column>Goals {websiteId}</Column>;
}
