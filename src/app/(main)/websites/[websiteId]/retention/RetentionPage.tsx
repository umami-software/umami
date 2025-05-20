'use client';
import { RetentionTable } from './RetentionTable';

export function RetentionPage({ websiteId }: { websiteId: string }) {
  return <RetentionTable websiteId={websiteId} />;
}
