import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest, getQueryFilters, setWebsiteDate } from '@/lib/request';
import { reportResultSchema } from '@/lib/schema';
import {
  getCheckoutAbandonment,
  CheckoutAbandonmentParameters,
} from '@/queries/sql/first8marketing/getCheckoutAbandonment';

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, reportResultSchema);

  if (error) {
    return error();
  }

  const { websiteId } = body;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const parameters = await setWebsiteDate(websiteId, body.parameters);
  const filters = await getQueryFilters(body.filters, websiteId);

  const data = await getCheckoutAbandonment(
    websiteId,
    parameters as CheckoutAbandonmentParameters,
    filters,
  );

  return json(data);
}

