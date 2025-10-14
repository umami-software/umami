import { z } from 'zod';
import { canUpdateUser, canViewUser, canDeleteUser } from '@/permissions';
import { getUser, getUserByUsername, updateUser, deleteUser } from '@/queries/prisma';
import { json, unauthorized, badRequest, ok } from '@/lib/response';
import { hashPassword } from '@/lib/password';
import { parseRequest } from '@/lib/request';
import { userRoleParam } from '@/lib/schema';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canViewUser(auth, userId))) {
    return unauthorized();
  }

  const user = await getUser(userId);

  return json(user);
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    username: z.string().max(255).optional(),
    password: z.string().max(255).optional(),
    role: userRoleParam.optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canUpdateUser(auth, userId))) {
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
      return badRequest({ message: 'User already exists' });
    }
  }

  const updated = await updateUser(userId, data);

  return json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canDeleteUser(auth))) {
    return unauthorized();
  }

  if (userId === auth.user.id) {
    return badRequest({ message: 'You cannot delete yourself.' });
  }

  await deleteUser(userId);

  return ok();
}
