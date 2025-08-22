import prisma from '@/lib/prisma';

export async function createOidcState(data: { state: string; codeVerifier: string }): Promise<{
  state: string;
  codeVerifier: string;
}> {
  return prisma.client.oidcState.create({
    data,
    select: {
      state: true,
      codeVerifier: true,
    },
  });
}

export async function getOidcState(state: string): Promise<{
  state: string;
  codeVerifier: string;
  createdAt: Date;
}> {
  return prisma.client.oidcState.findUnique({
    where: {
      state: state,
    },
    select: {
      state: true,
      codeVerifier: true,
      createdAt: true,
    },
  });
}
