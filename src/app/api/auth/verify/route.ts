import { fetchAccount, fetchTeam } from '@/lib/load';
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
        isNoBilling: account.isNoBilling || false,
        hasSubscription: account.hasSubscription || false,
      };
    }

    const teamsWithSubscription = await Promise.all(
      teams.map(async (team: any) => {
        const teamAccount = await fetchTeam(team.id);
        return {
          ...team,
          subscription: teamAccount
            ? {
                isPro: teamAccount.isPro || false,
                isBusiness: teamAccount.isBusiness || false,
                isNoBilling: teamAccount.isNoBilling || false,
                hasSubscription: teamAccount.hasSubscription || false,
              }
            : null,
        };
      }),
    );

    return json({ ...user, teams: teamsWithSubscription });
  }

  return json({ ...user, teams });
}
