import { getConfig } from '@/lib/config';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { forbidden, json, notFound } from '@/lib/response';
import { getInstallationRecords } from '@/queries/sql/getInstallationRecords';
import { type InstallationInventory, installationQuerySchema } from './contract';

export async function GET(request: Request) {
  const { settingsEnabled, settingsOverride } = getConfig();

  if (!settingsEnabled) {
    return notFound();
  }

  const { auth, query, error } = await parseRequest(request, installationQuerySchema);

  if (error) {
    return error();
  }

  if (auth.authType !== 'session' || !auth.user || !(settingsOverride || auth.user.isAdmin)) {
    return forbidden();
  }

  if (query.section === 'records') {
    return json(await getInstallationRecords());
  }

  const where = { deletedAt: null };
  const [users, teams, websites] = await Promise.all([
    prisma.client.user.count({ where }),
    prisma.client.team.count({ where }),
    prisma.client.website.count({ where }),
  ]);
  const inventory: InstallationInventory = { users, teams, websites };

  return json(inventory);
}
