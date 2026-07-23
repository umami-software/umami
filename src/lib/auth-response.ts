import { saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { createSecureToken } from '@/lib/jwt';
import redis from '@/lib/redis';
import { getAllUserTeams } from '@/queries/prisma';

export interface AuthResponseUser {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date | null;
}

export async function getAuthResponseUser(user: Omit<AuthResponseUser, 'password'>) {
  const { id, username, role, createdAt } = user;
  const teams = await getAllUserTeams(id);

  return { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams };
}

export async function createAuthResponse(user: AuthResponseUser) {
  const { id, role } = user;
  const pwd = hash(user.password);
  const token = redis.enabled
    ? await saveAuth({ userId: id, role, pwd })
    : createSecureToken({ userId: id, role, pwd }, secret());

  return {
    token,
    user: await getAuthResponseUser(user),
  };
}
