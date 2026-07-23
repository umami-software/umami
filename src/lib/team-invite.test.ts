import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import {
  buildTeamInviteUrl,
  createTeamInviteToken,
  getTeamInviteHardDeleteWhere,
  hashTeamInviteToken,
  isTeamInviteRedeemable,
  verifyTeamInviteToken,
} from './team-invite';

const NOW = new Date('2030-01-01T00:00:00.000Z');
const LATER = new Date('2030-01-02T00:00:00.000Z');

describe('team invite bearer tokens', () => {
  test('createTeamInviteToken encodes 32 CSPRNG bytes as a URL-safe bearer token', () => {
    const entropy = Uint8Array.from('0123456789abcdef0123456789abcdef', character =>
      character.charCodeAt(0),
    );
    const requestedSizes: number[] = [];

    const result = createTeamInviteToken({
      randomBytes: size => {
        requestedSizes.push(size);
        return entropy;
      },
    });

    expect(requestedSizes).toEqual([32]);
    expect(result.token).toBe(Buffer.from(entropy).toString('base64url'));
    expect(result.token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test('hashTeamInviteToken derives the persisted SHA-512 digest from the raw token', () => {
    const token = 'raw-invite-token';

    expect(hashTeamInviteToken(token)).toBe(createHash('sha512').update(token).digest('hex'));
  });

  test('verifyTeamInviteToken accepts only the raw token matching the persisted digest', () => {
    const digest = hashTeamInviteToken('correct-token');

    expect(verifyTeamInviteToken('correct-token', digest)).toBe(true);
    expect(verifyTeamInviteToken('wrong-token', digest)).toBe(false);
    expect(verifyTeamInviteToken('correct-token', digest.slice(2))).toBe(false);
  });

  test('buildTeamInviteUrl puts the bearer token in the fragment, never the path or query', () => {
    const token = 'sensitive/+token?';
    const url = new URL(
      buildTeamInviteUrl('https://analytics.example/register?utm_source=email', token),
    );

    expect(url.hash).toBe(`#invite=${encodeURIComponent(token)}`);
    expect(url.pathname).not.toContain(token);
    expect(url.search).not.toContain(token);
    expect(url.searchParams.get('utm_source')).toBe('email');
  });
});

describe('isTeamInviteRedeemable', () => {
  const activeInvite = {
    expiresAt: LATER,
    revokedAt: null,
    usedAt: null,
  };

  test('accepts an unused, unrevoked invite before its expiry boundary', () => {
    expect(isTeamInviteRedeemable(activeInvite, NOW)).toBe(true);
  });

  test.each([
    {
      name: 'expired exactly at the boundary',
      invite: { ...activeInvite, expiresAt: NOW },
    },
    {
      name: 'revoked',
      invite: { ...activeInvite, revokedAt: new Date('2029-12-31T23:00:00.000Z') },
    },
    {
      name: 'already used',
      invite: { ...activeInvite, usedAt: new Date('2029-12-31T23:00:00.000Z') },
    },
  ])('rejects an invite that is $name', ({ invite }) => {
    expect(isTeamInviteRedeemable(invite, NOW)).toBe(false);
  });
});

describe('getTeamInviteHardDeleteWhere', () => {
  test('selects every invite attributable to the deleted user or their owned teams', () => {
    expect(getTeamInviteHardDeleteWhere('user-1', ['owned-team-1', 'owned-team-2'])).toEqual({
      OR: [
        { issuerId: 'user-1' },
        { usedBy: 'user-1' },
        { teamId: { in: ['owned-team-1', 'owned-team-2'] } },
      ],
    });
  });
});
