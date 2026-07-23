import { describe, expect, test } from 'vitest';
import { ROLES } from '@/lib/constants';
import {
  hashTeamInviteToken,
  issueTeamInvite,
  redeemTeamInvite,
  type TeamInviteRepository,
  type TeamInviteTransaction,
} from './team-invite';

const NOW = new Date('2030-01-01T00:00:00.000Z');
const EXPIRES_AT = new Date('2030-01-08T00:00:00.000Z');
const RAW_TOKEN = 'valid-raw-invite-token';

interface StoredInvite {
  id: string;
  teamId: string;
  issuerId: string;
  role: string;
  tokenDigest: string;
  expiresAt: Date;
  revokedAt: Date | null;
  usedAt: Date | null;
  usedBy: string | null;
}

interface StoredTeam {
  id: string;
  deletedAt: Date | null;
}

interface StoredUser {
  id: string;
  username: string;
  password: string;
  role: string;
  deletedAt: Date | null;
}

interface StoredTeamUser {
  id: string;
  teamId: string;
  userId: string;
  role: string;
}

interface RepositoryState {
  invites: StoredInvite[];
  teams: StoredTeam[];
  users: StoredUser[];
  teamUsers: StoredTeamUser[];
}

class InMemoryTeamInviteRepository implements TeamInviteRepository {
  state: RepositoryState;
  failTeamUserCreation = false;
  operationTrace: string[] = [];
  private transactionQueue = Promise.resolve();

  constructor({ seedInvite = true }: { seedInvite?: boolean } = {}) {
    this.state = {
      invites: seedInvite
        ? [
            {
              id: 'invite-1',
              teamId: 'team-1',
              issuerId: 'issuer-1',
              role: ROLES.teamMember,
              tokenDigest: hashTeamInviteToken(RAW_TOKEN),
              expiresAt: EXPIRES_AT,
              revokedAt: null,
              usedAt: null,
              usedBy: null,
            },
          ]
        : [],
      teams: [{ id: 'team-1', deletedAt: null }],
      users: [
        {
          id: 'issuer-1',
          username: 'issuer',
          password: 'issuer-password-hash',
          role: ROLES.user,
          deletedAt: null,
        },
      ],
      teamUsers: [
        {
          id: 'team-user-issuer',
          teamId: 'team-1',
          userId: 'issuer-1',
          role: ROLES.teamManager,
        },
      ],
    };
  }

  async transaction<T>(run: (transaction: TeamInviteTransaction) => Promise<T>): Promise<T> {
    const previous = this.transactionQueue;
    let release!: () => void;
    this.transactionQueue = new Promise<void>(resolve => {
      release = resolve;
    });

    await previous;
    const draft = structuredClone(this.state);

    try {
      const result = await run(this.createTransaction(draft));
      this.state = draft;
      return result;
    } finally {
      release();
    }
  }

  private createTransaction(state: RepositoryState): TeamInviteTransaction {
    return {
      findInviteByDigest: async tokenDigest =>
        state.invites.find(invite => invite.tokenDigest === tokenDigest) ?? null,
      findTeamById: async teamId => state.teams.find(team => team.id === teamId) ?? null,
      findUserById: async userId => {
        this.operationTrace.push(`user:${userId}`);
        return state.users.find(user => user.id === userId) ?? null;
      },
      findUserByUsername: async username =>
        state.users.find(user => user.username === username.toLowerCase()) ?? null,
      findTeamUser: async (teamId, userId) => {
        this.operationTrace.push(`membership:${userId}`);
        return (
          state.teamUsers.find(member => member.teamId === teamId && member.userId === userId) ??
          null
        );
      },
      createInvite: async data => {
        const invite: StoredInvite = {
          id: `invite-${state.invites.length + 1}`,
          teamId: data.teamId,
          issuerId: data.issuerId,
          role: data.role,
          tokenDigest: data.tokenDigest,
          expiresAt: data.expiresAt,
          revokedAt: null,
          usedAt: null,
          usedBy: null,
        };
        state.invites.push(invite);
        return invite;
      },
      createUser: async data => {
        const user: StoredUser = {
          id: `user-${state.users.length + 1}`,
          username: data.username,
          password: data.password,
          role: data.role,
          deletedAt: null,
        };
        state.users.push(user);
        return user;
      },
      createTeamUser: async data => {
        if (this.failTeamUserCreation) {
          throw new Error('membership write failed');
        }

        const teamUser: StoredTeamUser = {
          id: `team-user-${state.teamUsers.length + 1}`,
          teamId: data.teamId,
          userId: data.userId,
          role: data.role,
        };
        state.teamUsers.push(teamUser);
        return teamUser;
      },
      consumeInvite: async (inviteId, usedAt, usedBy) => {
        const invite = state.invites.find(candidate => candidate.id === inviteId);

        if (!invite || invite.usedAt || invite.revokedAt) {
          return false;
        }

        invite.usedAt = usedAt;
        invite.usedBy = usedBy;
        return true;
      },
    };
  }
}

const hashPassword = async (password: string) => `hashed:${password}`;

function register(repository: TeamInviteRepository, token = RAW_TOKEN) {
  return redeemTeamInvite(
    {
      token,
      registration: {
        username: 'Alice',
        password: 'correct horse battery staple',
      },
    },
    { repository, now: NOW, hashPassword },
  );
}

function accept(repository: TeamInviteRepository, userId = 'existing-user') {
  return redeemTeamInvite(
    {
      token: RAW_TOKEN,
      userId,
    },
    { repository, now: NOW, hashPassword },
  );
}

function addExistingUser(repository: InMemoryTeamInviteRepository) {
  repository.state.users.push({
    id: 'existing-user',
    username: 'existing',
    password: 'existing-password-hash',
    role: ROLES.user,
    deletedAt: null,
  });
}

describe('issueTeamInvite', () => {
  test('returns the raw token once while persisting only its SHA-512 digest', async () => {
    const repository = new InMemoryTeamInviteRepository({ seedInvite: false });
    const entropy = Uint8Array.from('0123456789abcdef0123456789abcdef', character =>
      character.charCodeAt(0),
    );

    const result = await issueTeamInvite(
      {
        teamId: 'team-1',
        issuerId: 'issuer-1',
        role: ROLES.teamMember,
        expiresAt: EXPIRES_AT,
      },
      { repository, randomBytes: () => entropy },
    );

    const persisted = repository.state.invites[0];
    expect(result.token).toBe(Buffer.from(entropy).toString('base64url'));
    expect(persisted.tokenDigest).toBe(hashTeamInviteToken(result.token));
    expect(persisted).not.toHaveProperty('token');
  });
});

describe('redeemTeamInvite registration', () => {
  test('lowercases the username, fixes the global role, and grants the invited team role', async () => {
    const repository = new InMemoryTeamInviteRepository();

    await register(repository);

    const user = repository.state.users.find(candidate => candidate.username === 'alice');
    expect(user).toMatchObject({ username: 'alice', role: ROLES.user });
    expect(repository.state.teamUsers).toContainEqual(
      expect.objectContaining({
        teamId: 'team-1',
        userId: user?.id,
        role: ROLES.teamMember,
      }),
    );
  });

  test('persists the password hash and never the registration password', async () => {
    const repository = new InMemoryTeamInviteRepository();

    await register(repository);

    const user = repository.state.users.find(candidate => candidate.username === 'alice');
    expect(user?.password).toBe('hashed:correct horse battery staple');
    expect(user?.password).not.toBe('correct horse battery staple');
  });

  test.each([
    { name: 'active account', deletedAt: null },
    { name: 'soft-deleted account', deletedAt: new Date('2029-01-01T00:00:00.000Z') },
  ])('rejects a username owned by an $name without consuming the invite', async ({ deletedAt }) => {
    const repository = new InMemoryTeamInviteRepository();
    repository.state.users.push({
      id: 'colliding-user',
      username: 'alice',
      password: 'existing-password-hash',
      role: ROLES.user,
      deletedAt,
    });

    await expect(register(repository)).rejects.toMatchObject({ code: 'USERNAME_UNAVAILABLE' });
    expect(repository.state.invites[0].usedAt).toBeNull();
    expect(repository.state.teamUsers).toHaveLength(1);
  });
});

describe('redeemTeamInvite for an authenticated user', () => {
  test('adds the existing account to the team without creating another user', async () => {
    const repository = new InMemoryTeamInviteRepository();
    addExistingUser(repository);
    const userCount = repository.state.users.length;

    await accept(repository);

    expect(repository.state.users).toHaveLength(userCount);
    expect(repository.state.teamUsers).toContainEqual(
      expect.objectContaining({
        teamId: 'team-1',
        userId: 'existing-user',
        role: ROLES.teamMember,
      }),
    );
  });

  test('rejects an account that is already a team member without consuming the invite', async () => {
    const repository = new InMemoryTeamInviteRepository();
    addExistingUser(repository);
    repository.state.teamUsers.push({
      id: 'existing-membership',
      teamId: 'team-1',
      userId: 'existing-user',
      role: ROLES.teamViewOnly,
    });

    await expect(accept(repository)).rejects.toMatchObject({ code: 'ALREADY_TEAM_MEMBER' });
    expect(repository.state.invites[0].usedAt).toBeNull();
  });

  test('rejects a soft-deleted authenticated account without consuming the invite', async () => {
    const repository = new InMemoryTeamInviteRepository();
    addExistingUser(repository);
    const existingUser = repository.state.users.find(user => user.id === 'existing-user');
    expect(existingUser).toBeDefined();
    if (existingUser) {
      existingUser.deletedAt = new Date('2029-01-01T00:00:00.000Z');
    }

    await expect(accept(repository)).rejects.toMatchObject({ code: 'INVALID_TEAM_INVITE' });
    expect(repository.state.invites[0].usedAt).toBeNull();
  });
});

describe('redeemTeamInvite attribution', () => {
  test('records the actual redeemer for registration and existing-account redemption', async () => {
    const registrationRepository = new InMemoryTeamInviteRepository();
    await register(registrationRepository);
    const registeredUser = registrationRepository.state.users.find(
      user => user.username === 'alice',
    );
    expect(registeredUser).toBeDefined();
    if (!registeredUser) {
      throw new Error('Registered user was not persisted.');
    }

    expect(registrationRepository.state.invites[0]).toMatchObject({
      usedAt: NOW,
      usedBy: registeredUser.id,
    });

    const existingUserRepository = new InMemoryTeamInviteRepository();
    addExistingUser(existingUserRepository);
    await accept(existingUserRepository);

    expect(existingUserRepository.state.invites[0]).toMatchObject({
      usedAt: NOW,
      usedBy: 'existing-user',
    });
  });
});

describe('redeemTeamInvite validity and atomicity', () => {
  test.each([
    {
      name: 'an unknown token',
      token: 'unknown-token',
      arrange: (_repository: InMemoryTeamInviteRepository) => undefined,
    },
    {
      name: 'an expired invite',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.invites[0].expiresAt = NOW;
      },
    },
    {
      name: 'a revoked invite',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.invites[0].revokedAt = new Date('2029-12-31T00:00:00.000Z');
      },
    },
    {
      name: 'a used invite',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.invites[0].usedAt = new Date('2029-12-31T00:00:00.000Z');
      },
    },
    {
      name: 'an invite for a deleted team',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.teams[0].deletedAt = new Date('2029-12-31T00:00:00.000Z');
      },
    },
    {
      name: 'an invite whose issuer left the team',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.teamUsers = repository.state.teamUsers.filter(
          member => member.userId !== 'issuer-1',
        );
      },
    },
    {
      name: 'an invite whose issuer can no longer grant roles',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.teamUsers[0].role = ROLES.teamMember;
      },
    },
    {
      name: 'an invite carrying a non-grantable role',
      token: RAW_TOKEN,
      arrange: (repository: InMemoryTeamInviteRepository) => {
        repository.state.invites[0].role = ROLES.teamManager;
      },
    },
  ])('rejects $name without creating an account or membership', async ({ token, arrange }) => {
    const repository = new InMemoryTeamInviteRepository();
    arrange(repository);
    const userCount = repository.state.users.length;
    const memberCount = repository.state.teamUsers.length;
    const usedAt = repository.state.invites[0].usedAt;

    await expect(register(repository, token)).rejects.toMatchObject({
      code: 'INVALID_TEAM_INVITE',
    });

    expect(repository.state.users).toHaveLength(userCount);
    expect(repository.state.teamUsers).toHaveLength(memberCount);
    expect(repository.state.invites[0].usedAt).toEqual(usedAt);
  });

  test('looks up authenticated redeemer and issuer in canonical unique order before memberships', async () => {
    const repository = new InMemoryTeamInviteRepository();
    addExistingUser(repository);

    await accept(repository);

    const firstMembershipLookup = repository.operationTrace.findIndex(operation =>
      operation.startsWith('membership:'),
    );
    expect(repository.operationTrace.slice(0, firstMembershipLookup)).toEqual([
      'user:existing-user',
      'user:issuer-1',
    ]);
  });

  test('allows only one winner when the same invite is redeemed concurrently', async () => {
    const repository = new InMemoryTeamInviteRepository();

    const results = await Promise.allSettled([register(repository), register(repository)]);
    const fulfilled = results.filter(result => result.status === 'fulfilled');
    const rejected = results.filter(result => result.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
      code: 'INVALID_TEAM_INVITE',
    });
    expect(repository.state.users.filter(user => user.username === 'alice')).toHaveLength(1);
    expect(repository.state.teamUsers.filter(member => member.userId !== 'issuer-1')).toHaveLength(
      1,
    );
    expect(repository.state.invites[0].usedAt).toEqual(NOW);
  });

  test('rolls back invite consumption and account creation when membership creation fails', async () => {
    const repository = new InMemoryTeamInviteRepository();
    repository.failTeamUserCreation = true;

    await expect(register(repository)).rejects.toThrow('membership write failed');

    expect(repository.state.invites[0].usedAt).toBeNull();
    expect(repository.state.users.find(user => user.username === 'alice')).toBeUndefined();
    expect(repository.state.teamUsers).toHaveLength(1);
  });
});
