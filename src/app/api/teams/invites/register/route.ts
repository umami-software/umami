import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { createAuthResponse } from '@/lib/auth-response';
import { getIpAddress } from '@/lib/ip';
import { hashPassword } from '@/lib/password';
import { isPasswordAuthDisabled } from '@/lib/password-auth';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import {
  badRequest,
  conflict,
  json,
  serverError,
  tooManyRequests,
  unauthorized,
  withNoStore,
} from '@/lib/response';
import {
  hashTeamInviteToken,
  redeemTeamInvite,
  TEAM_INVITE_ERROR_CODES,
  TeamInviteError,
} from '@/lib/team-invite';
import { teamInviteRepository } from '@/queries/prisma';

const noStore = withNoStore;

export async function POST(request: Request) {
  if (isPasswordAuthDisabled()) {
    return noStore(unauthorized());
  }

  const schema = z.object({
    token: z.string().min(1).max(512),
    username: z.string().trim().min(1).max(255),
    password: z.string().min(8).max(255),
  });
  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return noStore(error());
  }

  if (redis.enabled) {
    const digest = hashTeamInviteToken(body.token);
    const ip = getIpAddress(request.headers);
    const limits = [redis.client.rateLimit(`team-invite:register:token:${digest}`, 6, 60)];

    if (ip) {
      limits.push(redis.client.rateLimit(`team-invite:register:ip:${ip}`, 11, 60));
    }

    if ((await Promise.all(limits)).some(Boolean)) {
      return noStore(tooManyRequests());
    }
  }

  try {
    const { membership, team, user } = await redeemTeamInvite(
      {
        token: body.token,
        registration: { username: body.username, password: body.password },
      },
      { repository: teamInviteRepository, hashPassword },
    );

    if (!user.password) {
      throw new Error('Invitation registration did not return a password hash.');
    }

    const authResponse = await createAuthResponse({
      id: user.id,
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt ?? null,
    });

    return noStore(
      json({
        ...authResponse,
        team: { id: team.id, name: team.name },
        membership,
      }),
    );
  } catch (error) {
    if (error instanceof TeamInviteError) {
      if (error.code === TEAM_INVITE_ERROR_CODES.invalid) {
        return noStore(badRequest({ message: 'Invalid invitation.', code: error.code }));
      }

      return noStore(conflict({ message: 'Username is unavailable.', code: error.code }));
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return noStore(
        conflict({
          message: 'Username is unavailable.',
          code: TEAM_INVITE_ERROR_CODES.usernameUnavailable,
        }),
      );
    }

    return noStore(serverError(error));
  }
}
