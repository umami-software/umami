import { Metadata } from 'next';
import { ReportsLayout } from './ReportsLayout';

export default async function ({
  children,
  params,
}: {
  children: any;
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;

  return <ReportsLayout websiteId={websiteId}>{children}</ReportsLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Websites | Umami',
  },
};
