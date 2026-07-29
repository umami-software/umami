import { beforeEach, expect, test, vi } from 'vitest';
import { BOARD_TYPES } from '@/lib/boards';
import { getReport } from '@/queries/prisma';
import {
  canViewBoardEntities,
  hasValidBoardReports,
  stripInvalidBoardReports,
} from './board';
import { canViewLink } from './link';
import { canViewPixel } from './pixel';
import { canViewWebsite } from './website';

vi.mock('@/queries/prisma', () => ({
  getBoard: vi.fn(),
  getReport: vi.fn(),
  getTeamUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {},
}));

vi.mock('./website', () => ({
  canViewWebsite: vi.fn(),
}));

vi.mock('./pixel', () => ({
  canViewPixel: vi.fn(),
}));

vi.mock('./link', () => ({
  canViewLink: vi.fn(),
}));

const auth = {
  user: {
    id: 'user-1',
    username: 'user',
    role: 'user',
    isAdmin: false,
  },
  shareToken: {
    websiteIds: ['victim-website-id'],
  },
};

beforeEach(() => {
  vi.mocked(canViewWebsite).mockReset();
  vi.mocked(canViewPixel).mockReset();
  vi.mocked(canViewLink).mockReset();
  vi.mocked(getReport).mockReset();
});

test('canViewBoardEntities validates board IDs with user auth only', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);

  await expect(
    canViewBoardEntities(auth, BOARD_TYPES.website, { websiteId: 'owned-website-id' }),
  ).resolves.toBe(true);

  expect(canViewWebsite).toHaveBeenCalledWith(
    {
      user: auth.user,
    },
    'owned-website-id',
  );
});

test('canViewBoardEntities rejects IDs not accessible to the user', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(false);

  await expect(
    canViewBoardEntities(auth, BOARD_TYPES.mixed, {
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'WebsiteChart',
                entityType: 'website',
                entityId: 'victim-website-id',
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(false);
});

test('hasValidBoardReports allows saved reports for the board website', async () => {
  vi.mocked(getReport).mockResolvedValue({
    id: 'report-1',
    websiteId: 'website-1',
    type: 'goal',
  } as any);

  await expect(
    hasValidBoardReports(BOARD_TYPES.website, {
      websiteId: 'website-1',
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'Goal',
                props: {
                  reportId: 'report-1',
                },
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(true);
});

test('hasValidBoardReports rejects saved reports from a different website', async () => {
  vi.mocked(getReport).mockResolvedValue({
    id: 'report-1',
    websiteId: 'website-2',
    type: 'goal',
  } as any);

  await expect(
    hasValidBoardReports(BOARD_TYPES.website, {
      websiteId: 'website-1',
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'Goal',
                props: {
                  reportId: 'report-1',
                },
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(false);
});

test('hasValidBoardReports rejects saved reports with the wrong type', async () => {
  vi.mocked(getReport).mockResolvedValue({
    id: 'report-1',
    websiteId: 'website-1',
    type: 'funnel',
  } as any);

  await expect(
    hasValidBoardReports(BOARD_TYPES.website, {
      websiteId: 'website-1',
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'Goal',
                props: {
                  reportId: 'report-1',
                },
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(false);
});

test('hasValidBoardReports rejects report widgets without a website context', async () => {
  await expect(
    hasValidBoardReports(BOARD_TYPES.pixel, {
      pixelId: 'pixel-1',
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'Goal',
                props: {
                  reportId: 'report-1',
                },
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toBe(false);
});

test('stripInvalidBoardReports removes only invalid report IDs', async () => {
  vi.mocked(getReport).mockResolvedValue({
    id: 'report-1',
    websiteId: 'website-2',
    type: 'goal',
  } as any);

  await expect(
    stripInvalidBoardReports(BOARD_TYPES.website, {
      websiteId: 'website-1',
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'column-1',
              component: {
                type: 'Goal',
                title: 'Saved signup goal',
                description: 'Should stay on the board',
                props: {
                  reportId: 'report-1',
                  customValue: 'keep-me',
                },
              },
            },
          ],
        },
      ],
    }),
  ).resolves.toEqual({
    websiteId: 'website-1',
    rows: [
      {
        id: 'row-1',
        columns: [
          {
            id: 'column-1',
            component: {
              type: 'Goal',
              title: 'Saved signup goal',
              description: 'Should stay on the board',
              props: {
                customValue: 'keep-me',
              },
            },
          },
        ],
      },
    ],
  });
});
