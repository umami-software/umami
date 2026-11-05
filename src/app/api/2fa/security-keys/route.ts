import { parseRequest } from '@/lib/request';
import { json, notFound } from '@/lib/response';
import { getUserSecurityKeys } from '@/queries/prisma/securityKey';

export async function GET(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  return json(await getUserSecurityKeys(auth.user.id));
}
