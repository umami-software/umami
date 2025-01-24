import TeamProvider from './TeamProvider';
import { Metadata } from 'next';
import TeamSettingsLayout from './settings/TeamSettingsLayout';

export default async function ({
  children,
  params,
}: {
  children: any;
  params: { teamId: string };
}) {
  const { teamId } = await params;

  return (
    <TeamProvider teamId={teamId}>
      <TeamSettingsLayout>{children}</TeamSettingsLayout>
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Teams',
};
