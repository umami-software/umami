import { z } from 'zod';
import { canViewWebsite } from '@/lib/auth';
import { unauthorized, json, ok } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { getReports, createReport, updateReport } from '@/queries';
import { uuid } from '@/lib/crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { page, search, pageSize } = query;
  const filters = {
    page,
    pageSize,
    search,
  };

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getReports(
    {
      where: {
        websiteId,
        type: 'goals',
      },
    },
    filters,
  ).then(result => {
    result.data = result.data.map(report => {
      report.parameters = JSON.parse(report.parameters);

      return report;
    });

    return result;
  });

  return json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    type: z.enum(['page', 'event']),
    value: z.string(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const { id, name, type, value } = body;

  if (id) {
    await updateReport(id, {
      name,
      parameters: JSON.stringify({ name, type, value }),
    });
  } else {
    await createReport({
      id: uuid(),
      userId: auth.user.id,
      websiteId,
      type: 'goals',
      name,
      description: '',
      parameters: JSON.stringify({ name, type, value }),
    });
  }

  return ok();
}
