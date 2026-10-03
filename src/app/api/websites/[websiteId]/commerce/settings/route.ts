import { commerceSettingsSchema } from '@/lib/commerce-settings';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsiteSection } from '@/permissions';
import { getCommerceSettings } from '@/queries/prisma/commerce';

type Context = { params: Promise<{ websiteId: string }> };
export async function GET(request: Request, { params }: Context) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canViewWebsiteSection(auth, websiteId, 'commerce'))) return unauthorized();
  return json(await getCommerceSettings(websiteId));
}
export async function POST(request: Request, { params }: Context) {
  const { auth, body, error } = await parseRequest(request, commerceSettingsSchema);
  if (error) return error();
  const { websiteId } = await params;
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();
  await prisma.client.website.update({ where: { id: websiteId }, data: { commerceConfig: body } });
  return json(body);
}
