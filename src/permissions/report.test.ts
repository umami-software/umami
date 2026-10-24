import { expect, test, vi } from 'vitest';
import { ENTITY_TYPE, ROLES } from '@/lib/constants';
import { canViewReport, getReportSection } from './report';
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

vi.mock('@/lib/load', () => ({
  getBillingAccess: vi.fn(),
  getWebsiteBillingScope: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsite: vi.fn(),
}));

test('getReportSection maps saved report types to share sections', () => {
  expect(getReportSection('goal')).toBe('goals');
  expect(getReportSection('funnel')).toBe('funnels');
  expect(getReportSection('journey')).toBe('journeys');
  expect(getReportSection('revenue')).toBe('revenue');
  expect(getReportSection('heatmap')).toBe(null);
});

test('canViewReport allows board shares to fetch included saved goal reports', async () => {
  await expect(
    canViewReport(
      {
        shareToken: {
          shareType: ENTITY_TYPE.board,
          websiteIds: ['website-1'],
          parameters: {},
        },
      },
      {
        id: 'report-1',
        userId: 'owner-1',
        websiteId: 'website-1',
        type: 'goal',
      } as any,
    ),
  ).resolves.toBe(true);
});

test('canViewReport respects share section flags for saved funnel and goal reports', async () => {
  await expect(
    canViewReport(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            overview: true,
            funnels: false,
            goals: false,
          },
        },
      },
      {
        id: 'report-1',
        userId: 'owner-1',
        websiteId: 'website-1',
        type: 'funnel',
      } as any,
    ),
  ).resolves.toBe(false);

  await expect(
    canViewReport(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {
            overview: true,
            funnels: false,
            goals: true,
          },
        },
      },
      {
        id: 'report-2',
        userId: 'owner-1',
        websiteId: 'website-1',
        type: 'goal',
      } as any,
    ),
  ).resolves.toBe(true);
});

test('canViewReport denies share-token access to report types without a share section', async () => {
  await expect(
    canViewReport(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: {},
        },
      },
      {
        id: 'report-1',
        userId: 'owner-1',
        websiteId: 'website-1',
        type: 'heatmap',
      } as any,
    ),
  ).resolves.toBe(false);
});

test('canViewReport falls back to website access for authenticated users', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);

  await expect(
    canViewReport(
      {
        user: {
          id: 'user-1',
          username: 'user',
          role: 'user',
          isAdmin: false,
        },
      },
      {
        id: 'report-1',
        userId: 'owner-1',
        websiteId: 'website-1',
        type: 'heatmap',
      } as any,
    ),
  ).resolves.toBe(true);
});

test('canViewReport refuses reports outside the share sections to a limited member', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);
  getEntityMock.mockResolvedValue({ id: 'website-1', userId: null, teamId: 'team-1' });
  teamUserFindFirstMock.mockResolvedValue({
    role: ROLES.teamViewOnly,
    team: { viewOnlySections: ['goals'] },
  });

  const auth = { user: { id: 'user-1', username: 'user', role: 'user', isAdmin: false } };
  const report = { id: 'report-1', userId: 'owner-1', websiteId: 'website-1' };

  await expect(canViewReport(auth, { ...report, type: 'heatmap' } as any)).resolves.toBe(false);
  await expect(canViewReport(auth, { ...report, type: 'funnel' } as any)).resolves.toBe(false);
  await expect(canViewReport(auth, { ...report, type: 'goal' } as any)).resolves.toBe(true);
});
