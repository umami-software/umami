import { z } from 'zod';
import { canUpdateUser, canViewUser, checkAuth } from 'lib/auth';
import { getUser, getUserByUsername, updateUser } from 'queries';
import { json, unauthorized, badRequest } from 'lib/response';
import { hashPassword } from 'next-basics';
import { checkRequest } from 'lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const auth = await checkAuth(request);

  if (!auth || !(await canViewUser(auth, userId))) {
    return unauthorized();
  }

  const user = await getUser(userId);

  return json(user);
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    username: z.string().max(255),
    password: z.string().max(255),
    role: z.string().regex(/admin|user|view-only/i),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const { userId } = await params;
  const auth = await checkAuth(request);

  if (!auth || !(await canUpdateUser(auth, userId))) {
    return unauthorized();
  }

  const { username, password, role } = body;

  const user = await getUser(userId);

  const data: any = {};

  if (password) {
    data.password = hashPassword(password);
  }

  // Only admin can change these fields
  if (role && auth.user.isAdmin) {
    data.role = role;
  }

  if (username && auth.user.isAdmin) {
    data.username = username;
  }

  // Check when username changes
  if (data.username && user.username !== data.username) {
    const user = await getUserByUsername(username);

    if (user) {
      return badRequest('User already exists');
    }
  }

  const updated = await updateUser(userId, data);

  return json(updated);
}
