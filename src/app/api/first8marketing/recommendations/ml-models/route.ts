import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getMLModels } from '@/queries/sql/first8marketing/getMLModels';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  // Note: ML models are global, not website-specific
  // We just check if user is authenticated
  if (!auth) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status') || undefined;

  const data = await getMLModels({ limit, status });

  return json(data);
}

