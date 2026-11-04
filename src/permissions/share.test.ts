import { expect, test, vi } from 'vitest';
import { ENTITY_TYPE } from '@/lib/constants';
import {
  canViewAuthenticatedWebsite,
  canViewSharedWebsite,
  canViewSharedWebsiteFilters,
  canViewWebsiteSection,
  canViewWebsiteSectionRows,
} from './share';
import { canViewWebsite } from './website';

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

// Board shares carry no section flags and their components never show per-visitor
// session data, so a public board link must not unlock session endpoints.
test('canViewWebsiteSection denies the sessions section to board shares', async () => {
  const auth = {
    shareToken: {
      shareType: ENTITY_TYPE.board,
      websiteIds: ['website-1'],
      parameters: { allowFilter: true },
    },
  };

  await expect(canViewWebsiteSection(auth, 'website-1', 'sessions')).resolves.toBe(false);
  await expect(canViewWebsiteSection(auth, 'website-1', 'events')).resolves.toBe(true);
  // Weekly traffic is a board component and is served from a route that accepts overview.
  await expect(canViewWebsiteSection(auth, 'website-1', ['overview', 'sessions'])).resolves.toBe(
    true,
  );
});

// Legacy website shares without section flags keep their existing all-sections behavior.
test('canViewWebsiteSection keeps all sections for website shares without section flags', async () => {
  await expect(
    canViewWebsiteSection(
      { shareToken: { shareType: ENTITY_TYPE.website, websiteId: 'website-1', parameters: {} } },
      'website-1',
      'sessions',
    ),
  ).resolves.toBe(true);
});

// Row endpoints (raw events, revenue sessions, event data rows) expose individual
// visitors. Board components only render aggregates, so board shares cannot read rows.
test('canViewWebsiteSectionRows denies board shares', async () => {
  await expect(
    canViewWebsiteSectionRows(
      {
        shareToken: {
          shareType: ENTITY_TYPE.board,
          websiteIds: ['website-1'],
          parameters: {},
        },
      },
      'website-1',
      'events',
    ),
  ).resolves.toBe(false);
});

test('canViewWebsiteSectionRows allows website shares with the section enabled', async () => {
  await expect(
    canViewWebsiteSectionRows(
      {
        shareToken: {
          shareType: ENTITY_TYPE.website,
          websiteId: 'website-1',
          parameters: { events: true },
        },
      },
      'website-1',
      'events',
    ),
  ).resolves.toBe(true);
});

test('canViewWebsiteSectionRows defers to website access for logged-in users', async () => {
  vi.mocked(canViewWebsite).mockResolvedValue(true);

  await expect(
    canViewWebsiteSectionRows({ user: { id: 'user-1' } } as any, 'website-1', 'events'),
  ).resolves.toBe(true);
  expect(canViewWebsite).toHaveBeenCalledWith({ user: { id: 'user-1' } }, 'website-1');
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

// A share token sent together with a session must not lift the share's limits: anyone with an
// account could otherwise pair it with a share link to read sections the owner disabled.
// A signed-in non-owner who opens a share link still gets exactly what the share allows.
test('a share token sent with an unrelated session keeps the share scope', async () => {
  vi.mocked(canViewWebsite).mockReset().mockResolvedValue(false);
  const auth = {
    user: { id: 'other-user' },
    shareToken: {
      shareType: ENTITY_TYPE.website,
      websiteId: 'website-1',
      parameters: { overview: true, sessions: false, allowFilter: false },
    },
  } as any;

  await expect(canViewWebsiteSection(auth, 'website-1', 'overview')).resolves.toBe(true);
  await expect(canViewWebsiteSection(auth, 'website-1', 'sessions')).resolves.toBe(false);
  await expect(canViewSharedWebsiteFilters(auth, 'website-1')).resolves.toBe(false);
  expect(canViewWebsite).toHaveBeenCalledWith({ user: { id: 'other-user' } }, 'website-1');
});

// Export, replays, heatmaps and the share list are never available through a share link.
test('canViewAuthenticatedWebsite ignores a share token sent with an unrelated session', async () => {
  vi.mocked(canViewWebsite).mockReset().mockResolvedValue(false);
  const auth = {
    user: { id: 'other-user' },
    shareToken: { shareType: ENTITY_TYPE.website, websiteId: 'website-1', parameters: {} },
  } as any;

  await expect(canViewAuthenticatedWebsite(auth, 'website-1')).resolves.toBe(false);
  expect(canViewWebsite).toHaveBeenCalledWith({ user: { id: 'other-user' } }, 'website-1');
});

test('a board share token sent with an unrelated session still cannot read sessions or rows', async () => {
  vi.mocked(canViewWebsite).mockReset().mockResolvedValue(false);
  const auth = {
    user: { id: 'other-user' },
    shareToken: { shareType: ENTITY_TYPE.board, websiteIds: ['website-1'], parameters: {} },
  } as any;

  await expect(canViewWebsiteSection(auth, 'website-1', 'goals')).resolves.toBe(true);
  await expect(canViewWebsiteSection(auth, 'website-1', 'sessions')).resolves.toBe(false);
  await expect(canViewWebsiteSectionRows(auth, 'website-1', 'events')).resolves.toBe(false);
});

// Owners viewing their own share or board page keep full access to their website.
test('a website owner keeps full access when a share token is also sent', async () => {
  vi.mocked(canViewWebsite).mockReset().mockResolvedValue(true);
  const auth = {
    user: { id: 'owner' },
    shareToken: { shareType: ENTITY_TYPE.board, websiteIds: ['website-1'], parameters: {} },
  } as any;

  await expect(canViewWebsiteSection(auth, 'website-1', 'sessions')).resolves.toBe(true);
  await expect(canViewWebsiteSectionRows(auth, 'website-1', 'events')).resolves.toBe(true);
  await expect(canViewAuthenticatedWebsite(auth, 'website-1')).resolves.toBe(true);
});
