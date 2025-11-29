import { z } from 'zod';
import { canUpdateUser, canViewUser } from '@/permissions';
import { getUserPreferences, updateUserPreferences } from '@/queries/prisma';
import { json, unauthorized } from '@/lib/response';
import { parseRequest } from '@/lib/request';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canViewUser(auth, userId))) {
    return unauthorized();
  }

  const preferences = await getUserPreferences(userId);

  return json(preferences);
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({
    dateRange: z.string().max(50).nullable().optional(),
    timezone: z.string().max(100).nullable().optional(),
    language: z.string().max(10).nullable().optional(),
    theme: z.string().max(20).nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canUpdateUser(auth, userId))) {
    return unauthorized();
  }

  const data = Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));

  const preferences = await updateUserPreferences(userId, data);

  return json(preferences);
}
