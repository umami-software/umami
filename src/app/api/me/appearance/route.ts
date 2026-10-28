import { appearanceSchema, normalizeAppearance } from '@/lib/appearance';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';
import { deleteUserAppearance, getUserAppearance, saveUserAppearance } from '@/queries/prisma';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const row = await getUserAppearance(auth.user.id);

  return json({ settings: row ? normalizeAppearance(row.settings) : null });
}

export async function PUT(request: Request) {
  const { auth, body, error } = await parseRequest(request, appearanceSchema);

  if (error) {
    return error();
  }

  await saveUserAppearance(auth.user.id, body);

  return json({ settings: body });
}

export async function DELETE(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  await deleteUserAppearance(auth.user.id);

  return json({ settings: null });
}
