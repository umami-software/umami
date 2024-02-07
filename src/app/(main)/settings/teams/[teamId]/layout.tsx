'use client';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';

export default function ({ children, params: { teamId } }) {
  return <TeamProvider teamId={teamId}>{children}</TeamProvider>;
}
