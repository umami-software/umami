import { featureAdoptionQuerySchema } from '@/lib/analytics-schema';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canViewWebsiteSection } from '@/permissions';
import {
  getFeatureAdoption,
  type FeatureAdoptionParameters,
} from '@/queries/sql/features/getFeatureAdoption';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, featureAdoptionQuerySchema);

  if (error) return error();

  const { websiteId } = await params;

  if (!(await canViewWebsiteSection(auth, websiteId, 'feature-adoption'))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query, websiteId);
  const parameters = { ...query, ...filters } as FeatureAdoptionParameters;

  return json(await getFeatureAdoption(websiteId, parameters, filters));
}
