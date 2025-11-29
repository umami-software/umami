import { z } from 'zod';
import { SHARE_ID_REGEX } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, serverError, unauthorized } from '@/lib/response';
import { canDeleteBoard, canUpdateBoard, canViewBoard } from '@/permissions';
import { deleteBoard, getBoard, updateBoard } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { boardId } = await params;

  if (!(await canViewBoard(auth, boardId))) {
    return unauthorized();
  }

  const board = await getBoard(boardId);

  return json(board);
}

export async function POST(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const schema = z.object({
    name: z.string().optional(),
    domain: z.string().optional(),
    shareId: z.string().regex(SHARE_ID_REGEX).nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { boardId } = await params;
  const { name, domain, shareId } = body;

  if (!(await canUpdateBoard(auth, boardId))) {
    return unauthorized();
  }

  try {
    const board = await updateBoard(boardId, { name, domain, shareId });

    return Response.json(board);
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint') && e.message.includes('slug')) {
      return badRequest({ message: 'That slug is already taken.' });
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { boardId } = await params;

  if (!(await canDeleteBoard(auth, boardId))) {
    return unauthorized();
  }

  await deleteBoard(boardId);

  return ok();
}
