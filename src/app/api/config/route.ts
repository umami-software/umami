import { getConfig } from '@/lib/config';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { error } = await parseRequest(request, null, { skipAuth: true });

  if (error) {
    return error();
  }

  return json(getConfig());
}
