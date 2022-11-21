import { Prisma, Permission } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createPermission(data: Prisma.PermissionCreateInput): Promise<Permission> {
  return prisma.client.permission.create({
    data,
  });
}

export async function getPermission(where: Prisma.PermissionWhereUniqueInput): Promise<Permission> {
  return prisma.client.permission.findUnique({
    where,
  });
}

export async function getPermissions(where: Prisma.PermissionWhereInput): Promise<Permission[]> {
  return prisma.client.permission.findMany({
    where,
  });
}

export async function getPermissionsByUserId(userId, name?: string): Promise<Permission[]> {
  return prisma.client.permission.findMany({
    where: {
      ...(name ? { name } : {}),
      RolePermission: {
        every: {
          role: {
            is: {
              userRoles: {
                every: {
                  userId,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function updatePermission(
  data: Prisma.PermissionUpdateInput,
  where: Prisma.PermissionWhereUniqueInput,
): Promise<Permission> {
  return prisma.client.permission.update({
    data,
    where,
  });
}

export async function deletePermission(permissionId: string): Promise<Permission> {
  return prisma.client.permission.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: permissionId,
    },
  });
}
