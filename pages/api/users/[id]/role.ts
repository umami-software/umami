import { UserRole } from '@prisma/client';
import { NextApiRequestQueryBody } from 'interface/api/nextApi';
import { checkPermission } from 'lib/auth';
import { UmamiApi } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { useAuth } from 'lib/middleware';
import { NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { createUserRole, deleteUserRole, getUserRole, getUserRoles } from 'queries';

export interface UserRoleRequestQuery {
  id: string;
}

export interface UserRoleRequestBody {
  roleId: string;
  teamId?: string;
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

  if (id !== userId || !(await checkPermission(req, UmamiApi.Permission.Admin))) {
    return unauthorized(res);
  }

  if (req.method === 'GET') {
    const userRole = await getUserRoles({ userId: id });

    return ok(res, userRole);
  }

  if (req.method === 'POST') {
    const { roleId, teamId } = req.body;

    // Check when userRolename changes
    const userRole = getUserRole({ userId: id, roleId, teamId });

    if (userRole) {
      return badRequest(res, 'Role already exists for User.');
    }

    const updated = await createUserRole({ id: uuid(), userId: id, roleId, teamId });

    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const { userRoleId } = req.body;

    // Check when userRolename changes
    const userRole = getUserRole({ id: userRoleId });

    if (userRole) {
      return badRequest(res, 'Role already exists for User.');
    }

    const updated = await deleteUserRole(userRoleId);

    return ok(res, updated);
  }

  return methodNotAllowed(res);
};
