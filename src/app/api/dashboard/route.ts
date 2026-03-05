import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { createBoard, getBoard, updateBoard } from '@/queries/prisma';

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const board = await getBoard(auth.user.id);

  if (board && board.userId !== auth.user.id) {
    return unauthorized();
  }

  return json(board);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    parameters: z.object({}).passthrough().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const existing = await getBoard(userId);

  if (existing && existing.userId !== userId) {
    return unauthorized();
  }

  const data = {
    name: body.name,
    description: body.description,
    parameters: body.parameters ?? {},
  };

  if (existing) {
    const result = await updateBoard(userId, data);

    return json(result);
  }

  const result = await createBoard({
    id: userId,
    type: 'dashboard',
    slug: uuid(),
    userId,
    ...data,
  });

  return json(result);
}
