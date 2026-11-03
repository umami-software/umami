import { beforeEach, expect, test, vi } from 'vitest';
import { ENTITY_TYPE, ROLES } from '@/lib/constants';
import {
  canViewAuthenticatedWebsite,
  canViewSharedWebsite,
  canViewSharedWebsiteFilters,
  canViewWebsiteSection,
  getMemberSections,
} from './share';
import { canViewWebsite } from './website';

const { getEntityMock, teamUserFindFirstMock } = vi.hoisted(() => ({
  getEntityMock: vi.fn(),
  teamUserFindFirstMock: vi.fn(),
}));

vi.mock('./website', () => ({
  canViewWebsite: vi.fn(),
}));

vi.mock('@/lib/entity', () => ({
  getEntity: getEntityMock,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      teamUser: {
        findFirst: teamUserFindFirstMock,
      },
    },
  },
}));

const member = { user: { id: 'user-1', role: 'user', isAdmin: false } } as any;

function setMembership(role: string, viewOnlySections: unknown, website = {}) {
  vi.mocked(canViewWebsite).mockResolvedValue(true);
  getEntityMock.mockResolvedValue({ id: 'website-1', userId: null, teamId: 'team-1', ...website });
  teamUserFindFirstMock.mockResolvedValue({ role, team: { viewOnlySections } });
}

beforeEach(() => {
  vi.mocked(canViewWebsite).mockReset();
  getEntityMock.mockReset();
  teamUserFindFirstMock.mockReset();
});

test('getMemberSections limits a view-only member to the team setting plus overview', async () => {
  setMembership(ROLES.teamViewOnly, ['events', 'goals']);

  await expect(getMemberSections(member, 'website-1')).resolves.toEqual([
    'overview',
    'events',
    'goals',
  ]);
});

test('getMemberSections ignores section names it does not know', async () => {
  setMembership(ROLES.teamViewOnly, ['events', 'replays']);

  await expect(getMemberSections(member, 'website-1')).resolves.toEqual(['overview', 'events']);
});

test('getMemberSections does not limit members when the team has no setting', async () => {
  setMembership(ROLES.teamViewOnly, null);

  await expect(getMemberSections(member, 'website-1')).resolves.toBeNull();
});

test('getMemberSections does not limit members above view-only', async () => {
  setMembership(ROLES.teamMember, ['events']);

  await expect(getMemberSections(member, 'website-1')).resolves.toBeNull();
});

test('getMemberSections does not limit the owner of a website', async () => {
  setMembership(ROLES.teamViewOnly, ['events'], { userId: 'user-1' });

  await expect(getMemberSections(member, 'website-1')).resolves.toBeNull();
  expect(teamUserFindFirstMock).not.toHaveBeenCalled();
});

test('getMemberSections does not limit admins', async () => {
  setMembership(ROLES.teamViewOnly, ['events']);

  await expect(
    getMemberSections({ user: { id: 'admin', isAdmin: true } } as any, 'website-1'),
  ).resolves.toBeNull();
});

test('canViewWebsiteSection holds a limited member to the team setting', async () => {
  setMembership(ROLES.teamViewOnly, ['events']);

  await expect(canViewWebsiteSection(member, 'website-1', 'overview')).resolves.toBe(true);
  await expect(canViewWebsiteSection(member, 'website-1', 'events')).resolves.toBe(true);
  await expect(canViewWebsiteSection(member, 'website-1', 'sessions')).resolves.toBe(false);
  await expect(canViewWebsiteSection(member, 'website-1', ['sessions', 'events'])).resolves.toBe(
    true,
  );
});

test('canViewWebsiteSection lets an unlimited member see every section', async () => {
  setMembership(ROLES.teamViewOnly, null);

  await expect(canViewWebsiteSection(member, 'website-1', 'sessions')).resolves.toBe(true);
});

test('canViewWebsiteSection still requires access to the website', async () => {
  setMembership(ROLES.teamViewOnly, null);
  vi.mocked(canViewWebsite).mockResolvedValue(false);

  await expect(canViewWebsiteSection(member, 'website-1', 'overview')).resolves.toBe(false);
});

test('canViewAuthenticatedWebsite refuses a limited member', async () => {
  setMembership(ROLES.teamViewOnly, ['events', 'sessions']);

  await expect(canViewAuthenticatedWebsite(member, 'website-1')).resolves.toBe(false);
});

test('canViewAuthenticatedWebsite allows an unlimited member', async () => {
  setMembership(ROLES.teamViewOnly, null);

  await expect(canViewAuthenticatedWebsite(member, 'website-1')).resolves.toBe(true);
});

test('canViewWebsiteSection allows board shares for included websites', async () => {
  await expect(
    canViewWebsiteSection(
      {
        shareToken: {
          shareType: ENTITY_TYPE.board,
          websiteIds: ['website-1'],
          parameters: {},
        },
      },
      'website-1',
      'goals',
    ),
  ).resolves.toBe(true);
});

test('canViewWebsiteSection respects section flags on website shares', async () => {
  await expect(
    canViewWebsiteSection(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            overview: true,
            goals: false,
          },
        },
      },
      'website-1',
      'goals',
    ),
  ).resolves.toBe(false);
});

test('canViewWebsiteSection allows any requested enabled section', async () => {
  await expect(
    canViewWebsiteSection(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            overview: true,
            compare: false,
          },
        },
      },
      'website-1',
      ['overview', 'compare'],
    ),
  ).resolves.toBe(true);
});

test('canViewSharedWebsite allows board shares for included websites', async () => {
  await expect(
    canViewSharedWebsite(
      {
        shareToken: {
          shareType: ENTITY_TYPE.board,
          websiteIds: ['website-1'],
          parameters: {},
        },
      },
      'website-1',
    ),
  ).resolves.toBe(true);
});

test('canViewSharedWebsiteFilters requires allowFilter for share tokens', async () => {
  await expect(
    canViewSharedWebsiteFilters(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            allowFilter: false,
          },
        },
      },
      'website-1',
    ),
  ).resolves.toBe(false);

  await expect(
    canViewSharedWebsiteFilters(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            allowFilter: true,
          },
        },
      },
      'website-1',
    ),
  ).resolves.toBe(true);
});

test('canViewWebsiteSection allows pixel shares for the shared entity id', async () => {
  await expect(
    canViewWebsiteSection(
      {
        shareToken: {
          shareType: ENTITY_TYPE.pixel,
          pixelId: 'pixel-1',
          parameters: {
            overview: true,
          },
        },
      },
      'pixel-1',
      'overview',
    ),
  ).resolves.toBe(true);
});

test('canViewWebsiteSection allows link shares for the shared entity id', async () => {
  await expect(
    canViewWebsiteSection(
      {
        shareToken: {
          shareType: ENTITY_TYPE.link,
          linkId: 'link-1',
          parameters: {
            overview: true,
          },
        },
      },
      'link-1',
      'overview',
    ),
  ).resolves.toBe(true);
});
