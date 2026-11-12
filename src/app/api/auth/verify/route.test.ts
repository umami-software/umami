import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getAllUserTeams: vi.fn(),
  addTeamBillingStatus: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
}));

vi.mock('@/lib/load', () => ({
  addTeamBillingStatus: mocks.addTeamBillingStatus,
}));

import { POST } from './route';

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getAllUserTeams.mockResolvedValue([]);
  mocks.addTeamBillingStatus.mockImplementation(async teams => teams);
});

function verifyRequest() {
  return new Request('http://localhost/api/auth/verify', { method: 'POST' });
}

test('POST keeps prompting a seeded-password session after a page reload', async () => {
  // The app restores the user from this route on reload; without the flag the password
  // dialog disappears and the default password stays in place.
  mocks.parseRequest.mockResolvedValue({
    auth: { user: { id: 'admin-1', username: 'admin' }, passwordChangeRequired: true },
    error: undefined,
  });

  const response = await POST(verifyRequest());

  await expect(response.json()).resolves.toMatchObject({
    id: 'admin-1',
    passwordChangeRequired: true,
  });
});
