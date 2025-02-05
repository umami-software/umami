import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  return json(auth);
}
