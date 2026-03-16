import { fetchAccount } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { getAllUserTeams } from '@/queries/prisma';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const user = { ...auth.user };
  const teams = await getAllUserTeams(user.id);

  if (process.env.CLOUD_MODE) {
    const account = await fetchAccount(user.id);

    if (account) {
      user.subscription = {
        isPro: account.isPro || false,
        isBusiness: account.isBusiness || false,
        hasSubscription: account.hasSubscription || false,
      };
    }
  }

  return json({ ...user, teams });
}
