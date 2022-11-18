import { Prisma, UserRole } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createUserRole(
  data: Prisma.UserRoleCreateInput | Prisma.UserRoleUncheckedCreateInput,
): Promise<UserRole> {
  return prisma.client.userRole.create({
    data,
  });
}

export async function getUserRole(where: Prisma.UserRoleWhereUniqueInput): Promise<UserRole> {
  return prisma.client.userRole.findUnique({
    where,
  });
}

export async function getUserRoles(where: Prisma.UserRoleWhereInput): Promise<UserRole[]> {
  return prisma.client.userRole.findMany({
    where,
  });
}

export async function updateUserRole(
  data: Prisma.UserRoleUpdateInput,
  where: Prisma.UserRoleWhereUniqueInput,
): Promise<UserRole> {
  return prisma.client.userRole.update({
    data,
    where,
  });
}

export async function deleteUserRole(userRoleId: string): Promise<UserRole> {
  return prisma.client.userRole.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: userRoleId,
    },
  });
}
