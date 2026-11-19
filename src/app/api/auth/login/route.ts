import { saveAuth } from '@/lib/auth';
import { PARTIAL_AUTH_TOKEN_TYPE, ROLES } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { createSecureToken } from '@/lib/jwt';
import { addTeamBillingStatus } from '@/lib/load';
import { checkPassword, hasDefaultPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json, serviceUnavailable, unauthorized } from '@/lib/response';
import { getTwoFactorConfigurationError, isTwoFactorConfigured } from '@/lib/two-factor/crypto';
import { getTwoFactorRequiredReason } from '@/lib/two-factor/policy';
import { getAllUserTeams, getUserByUsername } from '@/queries/prisma';
import { loginRequestSchema } from './schema';

export async function POST(request: Request) {
  const { body, error } = await parseRequest(request, loginRequestSchema, { skipAuth: true });

  if (error) {
    return error();
  }

  const { username, password } = body;

  const user = await getUserByUsername(username, { includePassword: true });

  if (!user || !checkPassword(password, user.password)) {
    return unauthorized({ code: 'incorrect-username-password' });
  }

  const { id, role, createdAt } = user;
  const passwordChangeRequired = hasDefaultPassword(user);
  const cloudMode = !!process.env.CLOUD_MODE;

  // Check if 2FA is enabled for this user
  const twoFactor = !cloudMode
    ? await prisma.client.twoFactorAuth.findUnique({ where: { userId: id } })
    : null;

  if (twoFactor?.isEnabled) {
    if (!isTwoFactorConfigured()) {
      return serviceUnavailable(getTwoFactorConfigurationError());
    }

    const partialToken = createSecureToken(
      { userId: id, type: PARTIAL_AUTH_TOKEN_TYPE },
      secret(),
      {
        expiresIn: '5m',
      },
    );
    return json({ requiresTwoFactor: true, partialToken });
  }
  // 2FA is required but not set up yet: the session is limited to the setup routes until it is.
  const twoFactorSetup =
    !cloudMode && isTwoFactorConfigured() && !!(await getTwoFactorRequiredReason(id));

  // Bind token to password hash so a password change invalidates old tokens.
  const pwd = hash(user.password);
  const session = { userId: id, role, pwd, ...(twoFactorSetup && { twoFactorSetup }) };

  let token: string;

  if (redis.enabled) {
    token = await saveAuth(session);
  } else {
    token = createSecureToken(session, secret());
  }

  const teams = await addTeamBillingStatus(await getAllUserTeams(id));

  return json({
    token,
    user: {
      id,
      username,
      role,
      createdAt,
      isAdmin: role === ROLES.admin,
      passwordChangeRequired,
      teams,
    },
  });
}
