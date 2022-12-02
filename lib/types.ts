/* eslint-disable no-unused-vars */
export enum EventType {
  Pageview = 1,
  Event = 2,
}

export enum AuthType {
  Website,
  User,
  Team,
}

export enum Permission {
  all = 'all',
  websiteCreate = 'website:create',
  websiteUpdate = 'website:update',
  websiteDelete = 'website:delete',
  teamCreate = 'team:create',
  teamUpdate = 'team:update',
  teamDelete = 'team:delete',
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  TeamOwner = 'team-owner',
  TeamMember = 'team-member',
  TeamGuest = 'team-guest',
}

export const Roles = {
  admin: { name: Role.Admin, permissions: [Permission.all] },
  member: {
    name: Role.User,
    permissions: [
      Permission.websiteCreate,
      Permission.websiteUpdate,
      Permission.websiteDelete,
      Permission.teamCreate,
    ],
  },
  teamOwner: {
    name: Role.TeamOwner,
    permissions: [
      Permission.teamUpdate,
      Permission.teamDelete,
      Permission.websiteCreate,
      Permission.websiteUpdate,
      Permission.websiteDelete,
    ],
  },
  teamMember: {
    name: Role.TeamMember,
    permissions: [Permission.websiteCreate, Permission.websiteUpdate, Permission.websiteDelete],
  },
  teamGuest: { name: Role.TeamGuest, permissions: [] },
};
