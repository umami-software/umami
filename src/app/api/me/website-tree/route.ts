import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { getWebsiteTreeForOwner } from '@/queries/prisma/websiteGroup';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const tree = await getWebsiteTreeForOwner({ userId: auth.user.id });

  return json(tree);
}
