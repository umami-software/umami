const userFindFirstMock = jest.fn();
const userCreateMock = jest.fn();
const userUpdateMock = jest.fn();
const websiteFindFirstMock = jest.fn();
const websiteCreateMock = jest.fn();
const websiteUpdateMock = jest.fn();
const uuidMock = jest.fn();
const hashPasswordMock = jest.fn();

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    client: {
      user: {
        create: userCreateMock,
        findFirst: userFindFirstMock,
        update: userUpdateMock,
      },
      website: {
        create: websiteCreateMock,
        findFirst: websiteFindFirstMock,
        update: websiteUpdateMock,
      },
    },
  },
}));

jest.mock('@/lib/crypto', () => ({
  uuid: uuidMock,
}));

jest.mock('@/lib/password', () => ({
  hashPassword: hashPasswordMock,
}));

import { POST } from './route';

const buildRequest = (
  body: Record<string, unknown>,
  headers: HeadersInit = {
    authorization: 'Bearer internal_secret',
  },
) =>
  new Request('http://localhost/api/internal/headlify/provision', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    method: 'POST',
  });

const validBody = {
  correlationId: 'corr_123',
  headlifyUser: {
    displayName: 'Tenant Owner',
    email: 'owner@example.com',
    id: '5',
  },
  tenant: {
    id: '10',
    name: 'Tenant A',
    slug: 'tenant-a',
  },
  website: {
    domain: 'headlify-tenant-a.framian-web-services.workers.dev',
    name: 'Tenant A',
  },
};

describe('Headlify internal provisioning route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HEADLIFY_UMAMI_INTERNAL_SECRET = 'internal_secret';
    uuidMock.mockReturnValueOnce('user-uuid-1').mockReturnValueOnce('website-uuid-1');
    hashPasswordMock.mockReturnValue('hashed-password');
  });

  it('returns 401 when the shared secret is invalid', async () => {
    const response = await POST(buildRequest(validBody, { authorization: 'Bearer wrong_secret' }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('unauthorized');
    expect(userFindFirstMock).not.toHaveBeenCalled();
  });

  it('creates a new Umami user and website for a Headlify owner', async () => {
    userFindFirstMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({
      id: 'user-uuid-1',
      username: 'owner@example.com',
    });
    websiteFindFirstMock.mockResolvedValue(null);
    websiteCreateMock.mockResolvedValue({
      domain: 'headlify-tenant-a.framian-web-services.workers.dev',
      id: 'website-uuid-1',
    });

    const response = await POST(buildRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(userCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: 'Tenant Owner',
          id: 'user-uuid-1',
          password: 'hashed-password',
          role: 'user',
          username: 'owner@example.com',
        }),
      }),
    );
    expect(websiteCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdBy: 'user-uuid-1',
          domain: 'headlify-tenant-a.framian-web-services.workers.dev',
          id: 'website-uuid-1',
          name: 'Tenant A',
          userId: 'user-uuid-1',
        }),
      }),
    );
    expect(body).toEqual({
      umamiUser: {
        created: true,
        id: 'user-uuid-1',
        username: 'owner@example.com',
      },
      website: {
        created: true,
        domain: 'headlify-tenant-a.framian-web-services.workers.dev',
        id: 'website-uuid-1',
        transferred: false,
      },
    });
  });

  it('reuses the existing Umami user and transfers a legacy website owner when needed', async () => {
    userFindFirstMock.mockResolvedValue({
      displayName: 'Tenant Owner',
      id: 'user-existing',
      username: 'owner@example.com',
    });
    websiteFindFirstMock.mockResolvedValue({
      createdBy: 'legacy-admin',
      domain: 'headlify-tenant-a.framian-web-services.workers.dev',
      id: 'website-existing',
      teamId: 'team-old',
      userId: 'legacy-user',
    });
    websiteUpdateMock.mockResolvedValue({
      domain: 'headlify-tenant-a.framian-web-services.workers.dev',
      id: 'website-existing',
    });

    const response = await POST(buildRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(userCreateMock).not.toHaveBeenCalled();
    expect(websiteUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          teamId: null,
          userId: 'user-existing',
        },
        where: {
          id: 'website-existing',
        },
      }),
    );
    expect(body).toEqual({
      umamiUser: {
        created: false,
        id: 'user-existing',
        username: 'owner@example.com',
      },
      website: {
        created: false,
        domain: 'headlify-tenant-a.framian-web-services.workers.dev',
        id: 'website-existing',
        transferred: true,
      },
    });
  });
});
