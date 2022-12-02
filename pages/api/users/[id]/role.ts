import { UserRole } from '@prisma/client';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { canUpdateUserRole } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { deleteUserRole, getUserRole, getUserRoles, updateUserRole } from 'queries';

export interface UserRoleRequestQuery {
  id: string;
}
export interface UserRoleRequestBody {
  role: UmamiApi.Role;
  userRoleId?: string;
}

export default async (
  req: NextApiRequestQueryBody<UserRoleRequestQuery, UserRoleRequestBody>,
  res: NextApiResponse<UserRole>,
) => {
  await useAuth(req, res);

  const {
    user: { id: userId },
  } = req.auth;
  const { id } = req.query;

  if (await canUpdateUserRole(userId)) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const userRole = await getUserRoles({ userId: id });

    return ok(res, userRole);
  }

  if (req.method === 'POST') {
    const { role } = req.body;

    const userRole = await getUserRole({ userId: id });

    if (userRole && userRole.role === role) {
      return badRequest(res, 'Role already exists for User.');
    } else {
      const updated = await updateUserRole({ role }, { id: userRole.id });

      return ok(res, updated);
    }
  }

  if (req.method === 'DELETE') {
    const { userRoleId } = req.body;

    const updated = await deleteUserRole(userRoleId);

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
