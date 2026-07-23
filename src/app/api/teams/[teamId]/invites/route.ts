import { z } from 'zod';
import { ROLES } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized, withNoStore } from '@/lib/response';
import { issueTeamInvite, TeamInviteError } from '@/lib/team-invite';
import { canIssueTeamInvite, canUpdateTeam } from '@/permissions';
import { getTeam, getTeamInvites, teamInviteRepository } from '@/queries/prisma';

const noStore = withNoStore;

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return noStore(error());
  }

  const { teamId } = await params;
  const team = await getTeam(teamId);

  if (!team || team.deletedAt) {
    return noStore(notFound({ message: 'Team not found.' }));
  }

  if (!(await canUpdateTeam(auth, teamId))) {
    return noStore(unauthorized({ message: 'You must be the owner/manager of this team.' }));
  }

  return noStore(json({ data: await getTeamInvites(teamId) }));
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    role: z.enum([ROLES.teamMember, ROLES.teamViewOnly]),
    expiresInDays: z.number().int().min(1).max(30).default(7),
  });
  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return noStore(error());
  }

  const { teamId } = await params;
  const team = await getTeam(teamId);

  if (!team || team.deletedAt) {
    return noStore(notFound({ message: 'Team not found.' }));
  }

  if (!(await canIssueTeamInvite(auth, teamId, body.role))) {
    return noStore(unauthorized({ message: 'You must be the owner/manager of this team.' }));
  }

  try {
    const expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000);
    const { invite, token } = await issueTeamInvite(
      {
        teamId,
        issuerId: auth.user.id,
        role: body.role,
        expiresAt,
      },
      { repository: teamInviteRepository },
    );

    return noStore(
      json({
        id: invite.id,
        teamId: invite.teamId,
        issuerId: invite.issuerId,
        role: invite.role,
        expiresAt: invite.expiresAt,
        revokedAt: invite.revokedAt,
        usedAt: invite.usedAt,
        usedBy: invite.usedBy ?? null,
        createdAt: invite.createdAt,
        token,
      }),
    );
  } catch (error) {
    if (error instanceof TeamInviteError) {
      return noStore(unauthorized({ message: 'You must be the owner/manager of this team.' }));
    }

    throw error;
  }
}
