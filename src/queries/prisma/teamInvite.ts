import { Prisma, type TeamInvite } from '@/generated/prisma/client';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import {
  hashTeamInviteToken,
  isTeamInviteRedeemable,
  TEAM_INVITE_ERROR_CODES,
  TeamInviteError,
  type TeamInviteMembership,
  type TeamInviteRepository,
  type TeamInviteTeam,
  type TeamInviteTransaction,
  type TeamInviteUser,
} from '@/lib/team-invite';
import { canGrantTeamInviteRole, isTeamInviteRole } from '@/permissions/team-invite';

const inviteMetadataSelect = {
  id: true,
  teamId: true,
  issuerId: true,
  role: true,
  expiresAt: true,
  revokedAt: true,
  usedAt: true,
  usedBy: true,
  createdAt: true,
} satisfies Prisma.TeamInviteSelect;

async function findLockedTeam(transaction: Prisma.TransactionClient, teamId: string) {
  const [team] = await transaction.$queryRaw<TeamInviteTeam[]>(Prisma.sql`
    SELECT
      team_id AS "id",
      name,
      deleted_at AS "deletedAt"
    FROM "team"
    WHERE team_id = ${teamId}
    FOR UPDATE
  `);

  return team ?? null;
}

async function findLockedUser(transaction: Prisma.TransactionClient, userId: string) {
  const [user] = await transaction.$queryRaw<TeamInviteUser[]>(Prisma.sql`
    SELECT
      user_id AS "id",
      username,
      password,
      role,
      deleted_at AS "deletedAt",
      created_at AS "createdAt"
    FROM "user"
    WHERE user_id = ${userId}
    FOR UPDATE
  `);

  return user ?? null;
}

async function findLockedTeamUser(
  transaction: Prisma.TransactionClient,
  teamId: string,
  userId: string,
) {
  const [teamUser] = await transaction.$queryRaw<TeamInviteMembership[]>(Prisma.sql`
    SELECT
      team_user_id AS "id",
      team_id AS "teamId",
      user_id AS "userId",
      role
    FROM team_user
    WHERE team_id = ${teamId} AND user_id = ${userId}
    FOR UPDATE
  `);

  return teamUser ?? null;
}

function createTeamInviteTransaction(transaction: Prisma.TransactionClient): TeamInviteTransaction {
  return {
    findInviteByDigest(tokenDigest) {
      return transaction.teamInvite.findUnique({ where: { tokenDigest } });
    },
    async lockInviteByDigest(tokenDigest) {
      const [invite] = await transaction.$queryRaw<TeamInvite[]>(Prisma.sql`
        SELECT
          team_invite_id AS "id",
          team_id AS "teamId",
          issuer_id AS "issuerId",
          token_digest AS "tokenDigest",
          role,
          expires_at AS "expiresAt",
          revoked_at AS "revokedAt",
          used_at AS "usedAt",
          used_by AS "usedBy",
          created_at AS "createdAt"
        FROM team_invite
        WHERE token_digest = ${tokenDigest}
        FOR UPDATE
      `);

      return invite ?? null;
    },
    findTeamById(teamId) {
      return findLockedTeam(transaction, teamId);
    },
    findUserById(userId) {
      return findLockedUser(transaction, userId);
    },
    findUserByUsername(username) {
      return transaction.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          password: true,
          role: true,
          deletedAt: true,
          createdAt: true,
        },
      });
    },
    findTeamUser(teamId, userId) {
      return findLockedTeamUser(transaction, teamId, userId);
    },
    async createInvite(data) {
      const team = await findLockedTeam(transaction, data.teamId);
      const issuer = await findLockedUser(transaction, data.issuerId);
      const issuerMembership =
        issuer?.role === ROLES.admin
          ? null
          : await findLockedTeamUser(transaction, data.teamId, data.issuerId);
      const issuerCanGrant =
        issuer?.role === ROLES.admin ||
        (!!issuerMembership && canGrantTeamInviteRole(issuerMembership.role, data.role));

      if (
        !team ||
        team.deletedAt ||
        !issuer ||
        issuer.deletedAt ||
        !isTeamInviteRole(data.role) ||
        !issuerCanGrant
      ) {
        throw new TeamInviteError(TEAM_INVITE_ERROR_CODES.invalid);
      }

      return transaction.teamInvite.create({
        data: { id: uuid(), ...data },
      });
    },
    createUser(data) {
      return transaction.user.create({
        data: { id: uuid(), ...data },
        select: {
          id: true,
          username: true,
          password: true,
          role: true,
          deletedAt: true,
          createdAt: true,
        },
      });
    },
    createTeamUser(data) {
      return transaction.teamUser.create({
        data: { id: uuid(), ...data },
        select: { id: true, teamId: true, userId: true, role: true },
      });
    },
    async consumeInvite(inviteId, usedAt, usedBy) {
      const result = await transaction.teamInvite.updateMany({
        where: {
          id: inviteId,
          revokedAt: null,
          usedAt: null,
          expiresAt: { gt: usedAt },
        },
        data: { usedAt, usedBy },
      });

      return result.count === 1;
    },
  };
}

export const teamInviteRepository: TeamInviteRepository = {
  transaction<T>(run: (transaction: TeamInviteTransaction) => Promise<T>): Promise<T> {
    return prisma.transaction((transaction: Prisma.TransactionClient) =>
      run(createTeamInviteTransaction(transaction)),
    ) as Promise<T>;
  },
};

export function getTeamInvites(teamId: string) {
  return prisma.client.teamInvite.findMany({
    where: { teamId },
    select: inviteMetadataSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeTeamInvite(teamId: string, inviteId: string, now = new Date()) {
  const result = await prisma.client.teamInvite.updateMany({
    where: {
      id: inviteId,
      teamId,
      revokedAt: null,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { revokedAt: now },
  });

  return result.count === 1;
}

export async function inspectTeamInvite(token: string, now = new Date()) {
  const invite = await prisma.client.teamInvite.findUnique({
    where: { tokenDigest: hashTeamInviteToken(token) },
    include: {
      team: { select: { id: true, name: true, deletedAt: true } },
      issuer: { select: { id: true, role: true, deletedAt: true } },
    },
  });

  if (
    !invite ||
    !isTeamInviteRedeemable(invite, now) ||
    !isTeamInviteRole(invite.role) ||
    invite.team.deletedAt ||
    invite.issuer.deletedAt
  ) {
    return null;
  }

  const issuerMembership = await prisma.client.teamUser.findFirst({
    where: { teamId: invite.teamId, userId: invite.issuerId },
    select: { role: true },
  });

  if (
    invite.issuer.role !== ROLES.admin &&
    (!issuerMembership || !canGrantTeamInviteRole(issuerMembership.role, invite.role))
  ) {
    return null;
  }

  return {
    id: invite.id,
    teamId: invite.teamId,
    teamName: invite.team.name,
    role: invite.role,
    expiresAt: invite.expiresAt,
  };
}
