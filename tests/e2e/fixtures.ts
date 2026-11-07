export const users = {
  userCreate: {
    username: 'playwright1',
    password: 'password',
    role: 'user',
  },
  userUpdate: {
    username: 'playwright1',
    role: 'view-only',
  },
  // Separate from userCreate: spec files run in parallel locally, and two specs creating the
  // same username race on the unique constraint.
  teamMemberCreate: {
    username: 'playwright-team-member',
    password: 'password',
    role: 'user',
  },
};

export const teams = {
  teamCreate: {
    name: 'playwright',
  },
  teamUpdate: {
    name: 'playwrightUpdate',
  },
};

export const websites = {
  websiteCreate: {
    name: 'Playwright Website',
    domain: 'playwright.com',
  },
  websiteUpdate: {
    name: 'Playwright Website Updated',
    domain: 'playwrightupdated.com',
  },
};
