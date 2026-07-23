import { describe, expect, test } from 'vitest';
import { ROLES } from '@/lib/constants';
import { canGrantTeamInviteRole } from './team-invite';

describe('canGrantTeamInviteRole', () => {
  test.each([
    {
      actorRole: ROLES.teamOwner,
      invitedRole: ROLES.teamMember,
    },
    {
      actorRole: ROLES.teamOwner,
      invitedRole: ROLES.teamViewOnly,
    },
    {
      actorRole: ROLES.teamManager,
      invitedRole: ROLES.teamMember,
    },
    {
      actorRole: ROLES.teamManager,
      invitedRole: ROLES.teamViewOnly,
    },
  ])('$actorRole can invite $invitedRole', ({ actorRole, invitedRole }) => {
    expect(canGrantTeamInviteRole(actorRole, invitedRole)).toBe(true);
  });

  test.each([
    {
      actorRole: ROLES.teamOwner,
      invitedRole: ROLES.teamOwner,
    },
    {
      actorRole: ROLES.teamOwner,
      invitedRole: ROLES.teamManager,
    },
    {
      actorRole: ROLES.teamManager,
      invitedRole: ROLES.teamOwner,
    },
    {
      actorRole: ROLES.teamManager,
      invitedRole: ROLES.teamManager,
    },
    {
      actorRole: ROLES.teamMember,
      invitedRole: ROLES.teamMember,
    },
    {
      actorRole: ROLES.teamViewOnly,
      invitedRole: ROLES.teamViewOnly,
    },
    {
      actorRole: ROLES.teamOwner,
      invitedRole: ROLES.user,
    },
  ])('$actorRole cannot invite $invitedRole', ({ actorRole, invitedRole }) => {
    expect(canGrantTeamInviteRole(actorRole, invitedRole)).toBe(false);
  });
});
