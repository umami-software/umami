import { z } from 'zod';
import { revokeUserSessions, setUserPassword } from '@/lib/auth-server';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, ok, unauthorized } from '@/lib/response';
import { userRoleParam } from '@/lib/schema';
import { canDeleteUser, canUpdateUser, canViewUser } from '@/permissions';
import { deleteUser, getUser, getUserByUsername, updateUser } from '@/queries/prisma';

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
    password: z.string().min(8).max(255).optional(),
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

  if (!user) {
    return notFound();
  }

  const data: any = {};

  // Only admin can change these fields
  if (role && auth.user.isAdmin) {
    data.role = role;
  }

  if (username && auth.user.isAdmin) {
    data.username = username.toLowerCase();
    data.displayUsername = username.toLowerCase();
  }

  // Check when username changes
  if (data.username && user.username !== data.username) {
    const existingUser = await getUserByUsername(data.username);

    if (existingUser && existingUser.id !== userId) {
      return badRequest({ message: 'User already exists' });
    }
  }

  if (password) {
    // Update the credential account row and revoke the user's existing sessions.
    await setUserPassword(userId, password);
    await revokeUserSessions(userId);
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

  // Revoke sessions first so Redis-stored sessions are cleared as well.
  await revokeUserSessions(userId);
  await deleteUser(userId);

  return ok();
}
