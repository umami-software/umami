import type { Metadata } from 'next';
import { ErrorIssuePage } from './ErrorIssuePage';

export default async function Page({
  params,
}: {
  params: Promise<{ websiteId: string; issueId: string }>;
}) {
  return <ErrorIssuePage {...(await params)} />;
}
export const metadata: Metadata = { title: 'Error details' };
