import { createHash, randomBytes as nodeRandomBytes, timingSafeEqual } from 'node:crypto';
import { ROLES } from '@/lib/constants';
import { canGrantTeamInviteRole, isTeamInviteRole } from '@/permissions/team-invite';

export const TEAM_INVITE_ERROR_CODES = {
  invalid: 'INVALID_TEAM_INVITE',
  usernameUnavailable: 'USERNAME_UNAVAILABLE',
  alreadyTeamMember: 'ALREADY_TEAM_MEMBER',
} as const;

export type TeamInviteErrorCode =
  (typeof TEAM_INVITE_ERROR_CODES)[keyof typeof TEAM_INVITE_ERROR_CODES];

export class TeamInviteError extends Error {
  constructor(public readonly code: TeamInviteErrorCode) {
    super(code);
    this.name = 'TeamInviteError';
  }
}

export interface TeamInviteRecord {
  id: string;
  teamId: string;
  issuerId: string;
  role: string;
  tokenDigest: string;
  expiresAt: Date;
  revokedAt: Date | null;
  usedAt: Date | null;
  usedBy?: string | null;
  createdAt?: Date;
}

export interface TeamInviteTeam {
  id: string;
  deletedAt: Date | null;
  name?: string;
}

export interface TeamInviteUser {
  id: string;
  username: string;
  role: string;
  password?: string;
  deletedAt: Date | null;
  createdAt?: Date | null;
}

export interface TeamInviteMembership {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

export interface TeamInviteTransaction {
  findInviteByDigest(tokenDigest: string): Promise<TeamInviteRecord | null>;
  lockInviteByDigest?(tokenDigest: string): Promise<TeamInviteRecord | null>;
  findTeamById(teamId: string): Promise<TeamInviteTeam | null>;
  findUserById(userId: string): Promise<TeamInviteUser | null>;
  findUserByUsername(username: string): Promise<TeamInviteUser | null>;
  findTeamUser(teamId: string, userId: string): Promise<TeamInviteMembership | null>;
  createInvite(data: {
    teamId: string;
    issuerId: string;
    role: string;
    tokenDigest: string;
    expiresAt: Date;
  }): Promise<TeamInviteRecord>;
  createUser(data: {
    username: string;
    password: string;
    role: typeof ROLES.user;
  }): Promise<TeamInviteUser>;
  createTeamUser(data: {
    teamId: string;
    userId: string;
    role: string;
  }): Promise<TeamInviteMembership>;
  consumeInvite(inviteId: string, usedAt: Date, usedBy: string): Promise<boolean>;
}

export interface TeamInviteRepository {
  transaction<T>(run: (transaction: TeamInviteTransaction) => Promise<T>): Promise<T>;
}

type RandomBytes = (size: number) => Uint8Array;

export function createTeamInviteToken({
  randomBytes = nodeRandomBytes,
}: {
  randomBytes?: RandomBytes;
} = {}) {
  const token = Buffer.from(randomBytes(32)).toString('base64url');

  return { token };
}

export function hashTeamInviteToken(token: string) {
  return createHash('sha512').update(token).digest('hex');
}

export function verifyTeamInviteToken(token: string, tokenDigest: string) {
  const actual = Buffer.from(hashTeamInviteToken(token), 'hex');
  const expected = Buffer.from(tokenDigest, 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function buildTeamInviteUrl(baseUrl: string, token: string) {
  const url = new URL(baseUrl);
  url.hash = `invite=${encodeURIComponent(token)}`;

  return url.toString();
}

export function getTeamInviteHardDeleteWhere(userId: string, teamIds: string[]) {
  return {
    OR: [{ issuerId: userId }, { usedBy: userId }, { teamId: { in: teamIds } }],
  };
}

export function isTeamInviteRedeemable(
  invite: Pick<TeamInviteRecord, 'expiresAt' | 'revokedAt' | 'usedAt'>,
  now = new Date(),
) {
  return !invite.revokedAt && !invite.usedAt && invite.expiresAt.getTime() > now.getTime();
}

function invalidInvite(): never {
  throw new TeamInviteError(TEAM_INVITE_ERROR_CODES.invalid);
}

function isUniqueConstraintViolation(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

export async function issueTeamInvite(
  input: {
    teamId: string;
    issuerId: string;
    role: string;
    expiresAt: Date;
  },
  dependencies: {
    repository: TeamInviteRepository;
    randomBytes?: RandomBytes;
  },
) {
  if (!isTeamInviteRole(input.role)) {
    invalidInvite();
  }

  const { token } = createTeamInviteToken({ randomBytes: dependencies.randomBytes });
  const tokenDigest = hashTeamInviteToken(token);
  const invite = await dependencies.repository.transaction(transaction =>
    transaction.createInvite({ ...input, tokenDigest }),
  );

  return {
    invite: {
      id: invite.id,
      teamId: invite.teamId,
      issuerId: invite.issuerId,
      role: invite.role,
      expiresAt: invite.expiresAt,
      revokedAt: invite.revokedAt,
      usedAt: invite.usedAt,
      usedBy: invite.usedBy ?? null,
      createdAt: invite.createdAt,
    },
    token,
  };
}

export async function redeemTeamInvite(
  input:
    | { token: string; userId: string; registration?: never }
    | {
        token: string;
        registration: { username: string; password: string };
        userId?: never;
      },
  dependencies: {
    repository: TeamInviteRepository;
    now?: Date;
    hashPassword?(password: string): string | Promise<string>;
  },
) {
  const now = dependencies.now ?? new Date();
  const tokenDigest = hashTeamInviteToken(input.token);

  return dependencies.repository.transaction(async transaction => {
    let invite = await transaction.findInviteByDigest(tokenDigest);

    if (!invite || !verifyTeamInviteToken(input.token, invite.tokenDigest)) {
      invalidInvite();
    }

    if (!isTeamInviteRedeemable(invite, now) || !isTeamInviteRole(invite.role)) {
      invalidInvite();
    }

    const team = await transaction.findTeamById(invite.teamId);
    const userIds = [invite.issuerId];

    if (!('registration' in input)) {
      userIds.push(input.userId);
    }

    const sortedUserIds = [...new Set(userIds)].sort();
    const usersById = new Map<string, TeamInviteUser | null>();

    for (const userId of sortedUserIds) {
      usersById.set(userId, await transaction.findUserById(userId));
    }

    const issuer = usersById.get(invite.issuerId) ?? null;
    let authenticatedUser: TeamInviteUser | null = null;

    if (!('registration' in input)) {
      authenticatedUser = usersById.get(input.userId) ?? null;

      if (!authenticatedUser || authenticatedUser.deletedAt) {
        invalidInvite();
      }
    }

    let registrationUsername: string | undefined;
    let existingUser: TeamInviteUser | null = null;

    if ('registration' in input) {
      registrationUsername = input.registration.username.trim().toLowerCase();
      existingUser = await transaction.findUserByUsername(registrationUsername);
    }

    const membershipsByUserId = new Map<string, TeamInviteMembership | null>();

    for (const userId of sortedUserIds) {
      membershipsByUserId.set(userId, await transaction.findTeamUser(invite.teamId, userId));
    }

    const issuerMembership = membershipsByUserId.get(invite.issuerId) ?? null;
    if (transaction.lockInviteByDigest) {
      const lockedInvite = await transaction.lockInviteByDigest(tokenDigest);

      if (
        !lockedInvite ||
        lockedInvite.id !== invite.id ||
        lockedInvite.teamId !== invite.teamId ||
        lockedInvite.issuerId !== invite.issuerId ||
        lockedInvite.role !== invite.role ||
        !verifyTeamInviteToken(input.token, lockedInvite.tokenDigest) ||
        !isTeamInviteRedeemable(lockedInvite, now)
      ) {
        invalidInvite();
      }

      invite = lockedInvite;
    }

    const issuerCanGrant =
      issuer?.role === ROLES.admin ||
      (!!issuerMembership && canGrantTeamInviteRole(issuerMembership.role, invite.role));

    if (!team || team.deletedAt || !issuer || issuer.deletedAt || !issuerCanGrant) {
      invalidInvite();
    }

    let user: TeamInviteUser;

    if ('registration' in input) {
      if (!dependencies.hashPassword) {
        throw new Error('Password hashing is required for invitation registration.');
      }

      if (!registrationUsername) {
        invalidInvite();
      }

      if (existingUser) {
        throw new TeamInviteError(TEAM_INVITE_ERROR_CODES.usernameUnavailable);
      }

      const password = await dependencies.hashPassword(input.registration.password);
      user = await transaction.createUser({
        username: registrationUsername,
        password,
        role: ROLES.user,
      });
    } else {
      if (!authenticatedUser) {
        invalidInvite();
      }

      user = authenticatedUser;
    }

    if (!('registration' in input) && membershipsByUserId.get(user.id)) {
      throw new TeamInviteError(TEAM_INVITE_ERROR_CODES.alreadyTeamMember);
    }

    let membership: TeamInviteMembership;

    try {
      membership = await transaction.createTeamUser({
        teamId: invite.teamId,
        userId: user.id,
        role: invite.role,
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new TeamInviteError(TEAM_INVITE_ERROR_CODES.alreadyTeamMember);
      }

      throw error;
    }
    const consumed = await transaction.consumeInvite(invite.id, now, user.id);

    if (!consumed) {
      invalidInvite();
    }

    return { membership, team, user };
  });
}
