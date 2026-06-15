import { saveAuth, saveRefreshToken} from '@/lib/auth';
import { PARTIAL_AUTH_TOKEN_TYPE, ROLES } from '@/lib/constants';
import { hash, secret, createRefreshToken } from '@/lib/crypto';
import { createSecureToken, getAccessExpiry, getRefreshExpiry, refreshTokensEnabled } from '@/lib/jwt';
import { checkPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json, serviceUnavailable, unauthorized } from '@/lib/response';
import { getTwoFactorConfigurationError, isTwoFactorConfigured } from '@/lib/two-factor/crypto';
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

  // Bind token to password hash so a password change invalidates old tokens.
  const pwd = hash(user.password);

  const teams = await getAllUserTeams(id);

  if (redis.enabled) {
    const token = await saveAuth({ userId: id, role });

    return json({
      token,
      user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
    });
  }

  // auth tokens live forever unless refresh tokens are enabled.
  const token = createSecureToken({ userId: user.id, role }, secret(), { expiresIn: getAccessExpiry() });

  console.log(token);

  if (!refreshTokensEnabled()) {
    console.log('no refresh config found');
    return json({
      token,
      user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
    })
  }

  const refreshToken = createRefreshToken();

  console.log('refreshToken: ' + refreshToken);
  await saveRefreshToken(id, refreshToken);

  return json({
    token,
    refreshToken,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
