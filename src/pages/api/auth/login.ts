import redis from '@umami/redis-client';
import debug from 'debug';
import { saveAuth } from 'lib/auth';
import { secret } from 'lib/crypto';
import { useValidate } from 'lib/middleware';
import { NextApiRequestQueryBody, User } from 'lib/types';
import { NextApiResponse } from 'next';
import {
  checkPassword,
  createSecureToken,
  forbidden,
  methodNotAllowed,
  ok,
  unauthorized,
} from 'next-basics';
import { getUserByUsername } from 'queries';
import * as yup from 'yup';
import { ROLES } from 'lib/constants';
import { getIpAddress } from 'lib/detect';

const log = debug('umami:auth');

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const schema = {
  POST: yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
  }),
};

export default async (
  req: NextApiRequestQueryBody<any, LoginRequestBody>,
  res: NextApiResponse<LoginResponse>,
) => {
  if (process.env.DISABLE_LOGIN) {
    return forbidden(res);
  }

  await useValidate(schema, req, res);

  if (req.method === 'POST') {
    const { username, password } = req.body;

    const user = await getUserByUsername(username, { includePassword: true });

    if (user && checkPassword(password, user.password)) {
      if (redis.enabled) {
        const token = await saveAuth({ userId: user.id });

        return ok(res, { token, user });
      }

      const token = createSecureToken({ userId: user.id }, secret());
      const { id, username, role, createdAt } = user;

      return ok(res, {
        token,
        user: { id, username, role, createdAt, isAdmin: role === ROLES.admin },
      });
    }

    log(
      `Login from ip ${getIpAddress(req)} with username "${username.replace(
        /["\r\n]/g,
        '',
      )}" failed.`,
    );

    return unauthorized(res, 'message.incorrect-username-password');
  }

  return methodNotAllowed(res);
};
