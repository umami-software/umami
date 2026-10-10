import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { reportResultSchema } from '@/lib/schema';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { getHeatmap, type HeatmapParameters } from '@/queries/sql';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(
    {
      ...body.filters,
      startAt: body.parameters.startDate.getTime(),
      endAt: body.parameters.endDate.getTime(),
      timezone: body.parameters.timezone,
      unit: body.parameters.unit,
    },
    websiteId,
  );

  const parameters = {
    ...filters,
    urlPath: body.parameters.urlPath,
    mode: body.parameters.mode,
  } as HeatmapParameters;

  const data = await getHeatmap(websiteId, parameters);

  return json(data);
}
