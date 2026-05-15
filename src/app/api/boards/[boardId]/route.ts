import { z } from 'zod';
import { BOARD_TYPES, normalizeBoardType } from '@/lib/boards';
import { parseRequest } from '@/lib/request';
import { json, ok, serverError, unauthorized } from '@/lib/response';
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
    type: z
      .enum([
        BOARD_TYPES.dashboard,
        BOARD_TYPES.mixed,
        BOARD_TYPES.website,
        BOARD_TYPES.pixel,
        BOARD_TYPES.link,
      ])
      .or(z.literal('open'))
      .optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    parameters: z.object({}).passthrough().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { boardId } = await params;
  const { name, description, parameters } = body;
  const type = normalizeBoardType(body.type);

  if (!(await canUpdateBoard(auth, boardId))) {
    return unauthorized();
  }

  try {
    const board = await updateBoard(boardId, { type, name, description, parameters });

    return Response.json(board);
  } catch (e: any) {
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
