import {
  type AuthenticationResponseJSON,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { z } from 'zod';
import { saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { createSecureToken } from '@/lib/jwt';
import { addTeamBillingStatus } from '@/lib/load';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/two-factor/rate-limit';
import { consumeChallenge, getPartialAuthUserId, getRelyingParty } from '@/lib/two-factor/webauthn';
import { getAllUserTeams, getUser } from '@/queries/prisma';
import { getSecurityKeyByCredentialId, updateSecurityKeyUsage } from '@/queries/prisma/securityKey';

export async function POST(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const schema = z.object({
    response: z.object({
      id: z.string(),
      rawId: z.string(),
      type: z.literal('public-key'),
      response: z.record(z.string(), z.any()),
      clientExtensionResults: z.record(z.string(), z.any()),
      authenticatorAttachment: z.string().optional(),
    }),
  });

  const userId = getPartialAuthUserId(request);

  if (!userId) {
    return unauthorized({ code: 'two-factor-error-invalid-partial-token' });
  }

  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return error();
  }

  const user = await getUser(userId, { includePassword: true });

  if (!user) {
    return unauthorized();
  }

  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return Response.json(
      {
        error: {
          code: 'two-factor-error-too-many-attempts',
          message: 'Too many failed attempts',
          lockedUntil: rateCheck.lockedUntil,
        },
      },
      { status: 429 },
    );
  }

  const response = body.response as AuthenticationResponseJSON;
  const { rpID, origin } = getRelyingParty(request);

  const expectedChallenge = await consumeChallenge(userId, 'authentication');

  if (!expectedChallenge) {
    return badRequest({
      code: 'security-key-error-challenge-expired',
      message: 'The security key request has expired',
    });
  }

  const securityKey = await getSecurityKeyByCredentialId(response.id);

  const verification =
    securityKey?.userId === userId
      ? await verifyAuthenticationResponse({
          response,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: {
            id: securityKey.credentialId,
            publicKey: new Uint8Array(Buffer.from(securityKey.publicKey, 'base64url')),
            counter: Number(securityKey.counter),
            transports: securityKey.transports,
          },
          requireUserVerification: false,
        }).catch(() => null)
      : null;

  if (!verification?.verified) {
    const { lockedUntil } = await recordFailedAttempt(userId);
    return badRequest({
      code: 'security-key-error-verification-failed',
      message: 'Security key verification failed',
      ...(lockedUntil && { lockedUntil }),
    });
  }

  await updateSecurityKeyUsage(securityKey.id, verification.authenticationInfo.newCounter);
  await resetRateLimit(userId);

  const { id, role, createdAt, username } = user;
  // Bind token to password hash so a password change invalidates old tokens.
  const pwd = hash(user.password);

  let token: string;
  if (redis.enabled) {
    token = await saveAuth({ userId: id, role, pwd });
  } else {
    token = createSecureToken({ userId: id, role, pwd }, secret());
  }

  const teams = await addTeamBillingStatus(await getAllUserTeams(id));

  return json({
    token,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
