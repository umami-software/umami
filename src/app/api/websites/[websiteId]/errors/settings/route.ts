import { errorAccess } from '@/lib/errors/access';
import { isErrorTrackingEnabled } from '@/lib/errors/config';
import { errorSettingsSchema } from '@/lib/errors/schema';
import prisma from '@/lib/prisma';
import { json } from '@/lib/response';
import { canUpdateWebsite } from '@/permissions';

type Context = { params: Promise<{ websiteId: string }> };
export async function GET(request: Request, context: Context) {
  const access = await errorAccess(request, await context.params);
  if (access.response) return access.response;
  return json({
    enabled: isErrorTrackingEnabled(access.website),
    retentionDays: access.website.errorRetentionDays,
    canManage: !!(await canUpdateWebsite(access.auth, access.website.id)),
  });
}
export async function PUT(request: Request, context: Context) {
  const access = await errorAccess(request, await context.params, errorSettingsSchema, true);
  if (access.response) return access.response;
  await prisma.client.website.update({
    where: { id: access.website.id },
    data: {
      errorsEnabled: access.body.enabled,
      errorRetentionDays: access.body.retentionDays,
    },
  });
  return json({ ok: true });
}
