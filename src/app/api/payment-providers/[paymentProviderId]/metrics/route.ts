import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { withDateRange } from '@/lib/schema';
import { getPaymentProviderById } from '@/queries/prisma';
import { getARR } from '@/queries/sql';

function canAccess(
  user: { id: string; isAdmin: boolean },
  row: { userId: string | null; teamId: string | null },
) {
  return user.isAdmin || row.userId === user.id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentProviderId: string }> },
) {
  const schema = withDateRange();

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { paymentProviderId } = await params;
  const row = await getPaymentProviderById(paymentProviderId);

  if (!row) {
    return notFound();
  }

  if (!canAccess(auth.user, row)) {
    return unauthorized();
  }

  const startDate = query.startDate ?? new Date(query.startAt as number);
  const endDate = query.endDate ?? new Date(query.endAt as number);

  const data = await getARR(paymentProviderId, startDate, endDate);

  return json(data);
}
