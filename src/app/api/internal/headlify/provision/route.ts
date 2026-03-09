import { z } from 'zod';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { hashPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import { badRequest, json, serverError, unauthorized } from '@/lib/response';

const requestSchema = z.object({
  correlationId: z.string().trim().min(1),
  headlifyUser: z.object({
    id: z.string().trim().min(1),
    email: z.email().max(255),
    displayName: z.string().trim().max(255).nullish(),
  }),
  tenant: z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1).max(100),
    slug: z.string().trim().min(1).max(255),
  }),
  website: z.object({
    name: z.string().trim().min(1).max(100),
    domain: z.string().trim().min(1).max(500),
  }),
});

function normalizeString(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeUsername(email: string) {
  return email.trim().toLowerCase();
}

function normalizeDomain(domain: string) {
  const normalized = domain.trim().toLowerCase();

  try {
    const url = new URL(normalized.match(/^https?:\/\//i) ? normalized : `https://${normalized}`);
    const path = url.pathname.replace(/\/+$/, '');
    return `${url.hostname.toLowerCase()}${path}`;
  } catch {
    return normalized.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  }
}

function buildRandomPassword() {
  return `${uuid().replace(/-/g, '')}${uuid().replace(/-/g, '')}Aa1!`;
}

function hasValidSecret(request: Request) {
  const expected = normalizeString(process.env.HEADLIFY_UMAMI_INTERNAL_SECRET);

  if (!expected) {
    return null;
  }

  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ?? null;

  return provided === expected;
}

async function ensureProvisionedUser({
  displayName,
  email,
}: {
  displayName: string | null;
  email: string;
}) {
  const username = normalizeUsername(email);

  const existingUser = await prisma.client.user.findFirst({
    select: {
      displayName: true,
      id: true,
      username: true,
    },
    where: {
      deletedAt: null,
      username,
    },
  });

  if (!existingUser) {
    const createdUser = await prisma.client.user.create({
      data: {
        displayName: displayName ?? undefined,
        id: uuid(),
        password: hashPassword(buildRandomPassword()),
        role: ROLES.user,
        username,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return {
      created: true,
      user: createdUser,
    };
  }

  if (!existingUser.displayName && displayName) {
    const updatedUser = await prisma.client.user.update({
      data: {
        displayName,
      },
      select: {
        id: true,
        username: true,
      },
      where: {
        id: existingUser.id,
      },
    });

    return {
      created: false,
      user: updatedUser,
    };
  }

  return {
    created: false,
    user: {
      id: existingUser.id,
      username: existingUser.username,
    },
  };
}

async function ensureProvisionedWebsite({
  domain,
  name,
  userId,
}: {
  domain: string;
  name: string;
  userId: string;
}) {
  const existingWebsite = await prisma.client.website.findFirst({
    select: {
      createdBy: true,
      domain: true,
      id: true,
      teamId: true,
      userId: true,
    },
    where: {
      deletedAt: null,
      domain,
    },
  });

  if (!existingWebsite) {
    const createdWebsite = await prisma.client.website.create({
      data: {
        createdBy: userId,
        domain,
        id: uuid(),
        name,
        userId,
      },
      select: {
        domain: true,
        id: true,
      },
    });

    return {
      created: true,
      transferred: false,
      website: createdWebsite,
    };
  }

  const shouldTransfer = existingWebsite.userId !== userId || existingWebsite.teamId !== null;
  const shouldSetCreator = !existingWebsite.createdBy;

  if (!shouldTransfer && !shouldSetCreator) {
    return {
      created: false,
      transferred: false,
      website: {
        domain: existingWebsite.domain ?? domain,
        id: existingWebsite.id,
      },
    };
  }

  const updatedWebsite = await prisma.client.website.update({
    data: {
      ...(shouldSetCreator ? { createdBy: userId } : {}),
      ...(shouldTransfer ? { teamId: null, userId } : {}),
    },
    select: {
      domain: true,
      id: true,
    },
    where: {
      id: existingWebsite.id,
    },
  });

  return {
    created: false,
    transferred: shouldTransfer,
    website: {
      domain: updatedWebsite.domain ?? domain,
      id: updatedWebsite.id,
    },
  };
}

export async function POST(request: Request) {
  const isAuthorized = hasValidSecret(request);

  if (isAuthorized === null) {
    return serverError({ message: 'Internal Headlify provisioning is not configured.' });
  }

  if (!isAuthorized) {
    return unauthorized();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequest();
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(z.treeifyError(parsed.error));
  }

  const { headlifyUser, tenant, website } = parsed.data;
  const displayName = normalizeString(headlifyUser.displayName) ?? normalizeString(tenant.name);
  const normalizedDomain = normalizeDomain(website.domain);

  try {
    const provisionedUser = await ensureProvisionedUser({
      displayName,
      email: headlifyUser.email,
    });
    const provisionedWebsite = await ensureProvisionedWebsite({
      domain: normalizedDomain,
      name: website.name,
      userId: provisionedUser.user.id,
    });

    return json({
      umamiUser: {
        created: provisionedUser.created,
        id: provisionedUser.user.id,
        username: provisionedUser.user.username,
      },
      website: {
        created: provisionedWebsite.created,
        domain: provisionedWebsite.website.domain,
        id: provisionedWebsite.website.id,
        transferred: provisionedWebsite.transferred,
      },
    });
  } catch (error) {
    return serverError({
      code: 'headlify-provision-failed',
      message: error instanceof Error ? error.message : 'Failed to provision Headlify analytics ownership.',
    });
  }
}
