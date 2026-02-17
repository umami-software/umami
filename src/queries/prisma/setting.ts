import prisma from '@/lib/prisma';
import { uuid } from '@/lib/crypto';

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.client.setting.findUnique({ where: { key }, select: { value: true } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  const existing = await prisma.client.setting.findUnique({ where: { key } });
  if (existing) {
    await prisma.client.setting.update({ where: { key }, data: { value } });
  } else {
    await prisma.client.setting.create({ data: { id: uuid(), key, value } });
  }
}
