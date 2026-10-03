import { commerceSettingsSchema } from '@/lib/commerce-settings';
import prisma from '@/lib/prisma';

export async function getCommerceSettings(websiteId: string) {
  const website = await prisma.client.website.findUnique({
    where: { id: websiteId },
    select: { commerceConfig: true },
  });
  return commerceSettingsSchema.parse(website?.commerceConfig ?? {});
}
