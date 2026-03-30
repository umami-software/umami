import { encrypt, secret } from '@/lib/crypto';
import prisma from '@/lib/prisma';

export async function getWebsiteGoogleAuth(websiteId: string) {
  return prisma.client.websiteGoogleAuth.findUnique({
    where: { websiteId },
  });
}

export async function upsertWebsiteGoogleAuth(
  websiteId: string,
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    email: string;
  },
) {
  return prisma.client.websiteGoogleAuth.upsert({
    where: { websiteId },
    create: {
      websiteId,
      accessToken: encrypt(data.accessToken, secret()),
      refreshToken: encrypt(data.refreshToken, secret()),
      expiresAt: data.expiresAt,
      email: data.email,
      propertyUrl: null,
    },
    update: {
      accessToken: encrypt(data.accessToken, secret()),
      refreshToken: encrypt(data.refreshToken, secret()),
      expiresAt: data.expiresAt,
      email: data.email,
    },
  });
}

export async function updateWebsiteGoogleAuthProperty(websiteId: string, propertyUrl: string) {
  return prisma.client.websiteGoogleAuth.update({
    where: { websiteId },
    data: { propertyUrl },
  });
}

export async function deleteWebsiteGoogleAuth(websiteId: string) {
  return prisma.client.websiteGoogleAuth.delete({
    where: { websiteId },
  });
}

export async function getWebsiteGoogleAuthStatus(websiteId: string) {
  const auth = await prisma.client.websiteGoogleAuth.findUnique({
    where: { websiteId },
    select: { email: true, propertyUrl: true },
  });

  if (!auth) return null;

  return { email: auth.email, propertyUrl: auth.propertyUrl };
}

export async function updateWebsiteGoogleAuthTokens(
  websiteId: string,
  accessToken: string,
  expiresAt: Date,
) {
  return prisma.client.websiteGoogleAuth.update({
    where: { websiteId },
    data: {
      accessToken: encrypt(accessToken, secret()),
      expiresAt,
    },
  });
}
