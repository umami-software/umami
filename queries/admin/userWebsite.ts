import { Prisma, UserWebsite } from '@prisma/client';
import prisma from 'lib/prisma';

export async function createUserWebsite(
  data: Prisma.UserWebsiteCreateInput | Prisma.UserWebsiteUncheckedCreateInput,
): Promise<UserWebsite> {
  return prisma.client.userWebsite.create({
    data,
  });
}

export async function getUserWebsite(
  where: Prisma.UserWebsiteWhereUniqueInput,
): Promise<UserWebsite> {
  return prisma.client.userWebsite.findUnique({
    where,
  });
}

export async function getUserWebsites(where: Prisma.UserWebsiteWhereInput): Promise<UserWebsite[]> {
  return prisma.client.userWebsite.findMany({
    where,
  });
}

export async function updateUserWebsite(
  data: Prisma.UserWebsiteUpdateInput,
  where: Prisma.UserWebsiteWhereUniqueInput,
): Promise<UserWebsite> {
  return prisma.client.userWebsite.update({
    data,
    where,
  });
}

export async function deleteUserWebsite(userWebsiteId: string): Promise<UserWebsite> {
  return prisma.client.userWebsite.update({
    data: {
      isDeleted: true,
    },
    where: {
      id: userWebsiteId,
    },
  });
}
