import { expect, test, vi } from 'vitest';
import { ENTITY_TYPE } from '@/lib/constants';
import {
  canViewSharedWebsite,
  canViewSharedWebsiteFilters,
  canViewWebsiteSection,
} from './share';

vi.mock('./website', () => ({
  canViewWebsite: vi.fn(),
}));

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
