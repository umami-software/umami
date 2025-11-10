import { Prisma } from '@/generated/prisma/client';
import redis from '@/lib/redis';
import { clickhouse, prisma } from '@/lib/prisma';
import { Website } from '@prisma/client';

export async function getWebsite(where: any): Promise<Website> {
  if (clickhouse.enabled) {
    const { rawQuery, findUnique } = clickhouse;

    const result = await rawQuery(
      `select * from website where ${Object.keys(where)[0]} = {value:String}`,
      {
        value: Object.values(where)[0],
      },
    );

    return findUnique(result);
  }

  return prisma.website.findUnique({
    where,
  });
}

export async function getWebsites(where: any): Promise<Website[]> {
  if (clickhouse.enabled) {
    const { rawQuery } = clickhouse;

    return rawQuery(`select * from website where "userId" = {userId:UUID}`, where);
  }

  return prisma.website.findMany({
    where,
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createWebsite(data: any): Promise<Website> {
  if (clickhouse.enabled) {
    const { rawQuery } = clickhouse;

    const result = await rawQuery(
      `insert into website ("id", "name", "domain", "userId", "shareId", "public") values ({id:UUID}, {name:String}, {domain:String}, {userId:UUID}, {shareId:String}, {public:Boolean})`,
      data,
    );

    return result[0];
  }

  return prisma.website.create({
    data,
  });
}

export async function updateWebsite(
  where: { id: string },
  data: { name?: string; domain?: string; shareId?: string; public?: boolean },
): Promise<Website> {
  if (clickhouse.enabled) {
    const { rawQuery } = clickhouse;

    const result = await rawQuery(
      `alter table website update "name" = {name:String}, "domain" = {domain:String}, "shareId" = {shareId:String}, "public" = {public:Boolean} where "id" = {id:UUID}`,
      {
        ...data,
        ...where,
      },
    );

    return result[0];
  }

  return prisma.website.update({
    where,
    data,
  });
}

export async function deleteWebsite(where: { id: string }): Promise<Website> {
  if (clickhouse.enabled) {
    const { rawQuery } = clickhouse;

    const result = await rawQuery(`delete from website where "id" = {id:UUID}`, where);

    return result[0];
  }

  return prisma.website.delete({
    where,
  });
}

export async function resetWebsite(websiteId: string): Promise<void> {
  if (clickhouse.enabled) {
    const { rawQuery } = clickhouse;

    await rawQuery(`delete from event where "websiteId" = {websiteId:UUID}`, {
      websiteId,
    });
    await rawQuery(`delete from session where "websiteId" = {websiteId:UUID}`, {
      websiteId,
    });
  } else {
    // For large datasets, we need to delete data in chunks to avoid transaction timeouts
    // We'll delete data in batches of 10000 records at a time
    const deleteInBatches = async (model: any, where: any) => {
      let deletedCount;
      do {
        // First, find records to delete (up to 10000)
        const recordsToDelete = await model.findMany({
          where,
          take: 10000,
          select: {
            id: true,
          },
        });
        
        if (recordsToDelete.length === 0) {
          deletedCount = 0;
          break;
        }
        
        // Then delete those records by their IDs
        const result = await model.deleteMany({
          where: {
            id: {
              in: recordsToDelete.map((record: any) => record.id),
            },
          },
        });
        
        deletedCount = result.count;
      } while (deletedCount > 0);
    };

    // Delete data in batches to avoid transaction timeouts
    await deleteInBatches(prisma.eventData, { websiteId });
    await deleteInBatches(prisma.sessionData, { websiteId });
    await deleteInBatches(prisma.websiteEvent, { websiteId });
    await deleteInBatches(prisma.session, { websiteId });
  }
}

export async function getAllUserWebsitesIncludingTeamOwner(userId: string, filters?: QueryFilters) {
  return getWebsites(
    {
      where: {
        OR: [
          { userId },
          {
            team: {
              deletedAt: null,
              members: {
                some: {
                  role: ROLES.teamOwner,
                  userId,
                },
              },
            },
          },
        ],
      },
    },
    {
      orderBy: 'name',
      ...filters,
    },
  );
}

export async function getUserWebsites(userId: string, filters?: QueryFilters) {
  return getWebsites(
    {
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    },
    {
      orderBy: 'name',
      ...filters,
    },
  );
}

export async function getTeamWebsites(teamId: string, filters?: QueryFilters) {
  return getWebsites(
    {
      where: {
        teamId,
      },
      include: {
        createUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
    filters,
  );
}

export async function getWebsiteCount(userId: string) {
  return prisma.client.website.count({
    where: {
      userId,
      deletedAt: null,
    },
  });
}
