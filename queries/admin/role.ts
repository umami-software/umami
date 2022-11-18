import { Prisma, Role } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createRole(data: {
  id: string;
  name: string;
  description: string;
}): Promise<Role> {
  return prisma.client.role.create({
    data,
  });
}

export async function getRole(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
  return prisma.client.role.findUnique({
    where,
  });
}

export async function getRoles(where: Prisma.RoleWhereInput): Promise<Role[]> {
  return prisma.client.role.findMany({
    where,
  });
}

export async function getRolesByUserId(userId: string): Promise<Role[]> {
  return prisma.client.role.findMany({
    where: {
      userRoles: {
        every: {
          userId,
        },
      },
    },
  });
}

export async function updateRole(
  data: Prisma.RoleUpdateInput,
  where: Prisma.RoleWhereUniqueInput,
): Promise<Role> {
  return prisma.client.role.update({
    data,
    where,
  });
}

export async function deleteRole(roleId: string): Promise<Role> {
  return prisma.client.role.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: roleId,
    },
  });
}
