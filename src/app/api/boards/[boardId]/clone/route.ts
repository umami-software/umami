import type { Prisma } from '@/generated/prisma/client';
import { z } from 'zod';
import { BOARD_TYPES, normalizeBoardType } from '@/lib/boards';
import type { BoardParameters } from '@/lib/types';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import {
  canCreateTeamWebsite,
  canCreateWebsite,
  canUpdateBoard,
  canViewBoardEntities,
  hasValidBoardReports,
  stripInvalidBoardReports,
} from '@/permissions';
import { createBoard, getBoard } from '@/queries/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const schema = z.object({
    name: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    parameters: z.object({}).passthrough().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { boardId } = await params;

  if (!(await canUpdateBoard(auth, boardId))) {
    return unauthorized();
  }

  const sourceBoard = await getBoard(boardId);

  if (!sourceBoard) {
    return unauthorized();
  }

  const sourceType = normalizeBoardType(sourceBoard.type);

  if (!sourceType || sourceType === BOARD_TYPES.dashboard) {
    return badRequest({ message: 'Board cannot be cloned.' });
  }

  if (
    (sourceBoard.teamId && !(await canCreateTeamWebsite(auth, sourceBoard.teamId))) ||
    !(await canCreateWebsite(auth))
  ) {
    return unauthorized();
  }

  const parameters = (body.parameters ?? sourceBoard.parameters ?? {}) as BoardParameters;

  if (!(await canViewBoardEntities(auth, sourceType, parameters))) {
    return badRequest({ message: 'Board contains inaccessible entities.' });
  }

  const sanitizedParameters = await stripInvalidBoardReports(sourceType, parameters);

  if (!(await hasValidBoardReports(sourceType, sanitizedParameters))) {
    return badRequest({ message: 'Board contains invalid saved reports.' });
  }

  const result = await createBoard({
    id: uuid(),
    type: sourceType,
    name: body.name ?? sourceBoard.name,
    description: body.description ?? sourceBoard.description,
    parameters: sanitizedParameters as Prisma.InputJsonValue,
    teamId: sourceBoard.teamId,
    userId: sourceBoard.teamId ? undefined : sourceBoard.userId ?? auth.user.id,
  });

  return json(result);
}
