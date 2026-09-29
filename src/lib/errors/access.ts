import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { badRequest, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewAuthenticatedWebsite } from '@/permissions';

export async function errorAccess(
  request: Request,
  params: Record<string, string>,
  schema?: z.ZodType,
  write = false,
) {
  if (Object.values(params).some(value => !z.uuid().safeParse(value).success)) {
    return { response: badRequest() };
  }
  const parsed = await parseRequest(request, schema);
  if (parsed.error) return { response: parsed.error() };
  const allowed = write
    ? await canUpdateWebsite(parsed.auth, params.websiteId)
    : await canViewAuthenticatedWebsite(parsed.auth, params.websiteId);
  if (!allowed) return { response: unauthorized() };
  const website = await prisma.client.website.findUnique({ where: { id: params.websiteId } });
  if (!website || website.deletedAt) return { response: notFound() };
  const issue = params.issueId
    ? await prisma.client.errorIssue.findFirst({
        where: { id: params.issueId, websiteId: params.websiteId },
      })
    : null;
  if (params.issueId && !issue) return { response: notFound() };
  return {
    ...parsed,
    website,
    issue,
    scope: {
      websiteId: website.id,
      resetAt: website.resetAt,
      retentionDays: website.errorRetentionDays,
    },
  };
}
