import prisma from 'lib/prisma';

export async function deleteAccount(user_id) {
  const { client } = prisma;

  return client.$transaction([
    client.pageview.deleteMany({
      where: { session: { website: { user_id } } },
    }),
    client.event_data.deleteMany({
      where: { event: { session: { website: { user_id } } } },
    }),
    client.event.deleteMany({
      where: { session: { website: { user_id } } },
    }),
    client.session.deleteMany({
      where: { website: { user_id } },
    }),
    client.website.deleteMany({
      where: { user_id },
    }),
    client.account.delete({
      where: {
        user_id,
      },
    }),
  ]);
}
