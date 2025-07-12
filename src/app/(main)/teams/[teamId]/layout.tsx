import { TeamProvider } from './TeamProvider';
import { Metadata } from 'next';

export default async function ({
  children,
  params,
}: {
  children: any;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  return <TeamProvider teamId={teamId}>{children}</TeamProvider>;
}

export const metadata: Metadata = {
  title: 'Teams',
};
