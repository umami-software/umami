import { hasPermission } from '@/lib/auth';
import { BOARD_ENTITY_TYPES, getBoardEntityIds, getResolvedComponentEntity } from '@/lib/boards';
import { PERMISSIONS } from '@/lib/constants';
import type { Auth, BoardComponentConfig, BoardParameters } from '@/lib/types';
import { getBoard, getReport, getTeamUser } from '@/queries/prisma';
import { canViewLink } from './link';
import { canViewPixel } from './pixel';
import { canViewWebsite } from './website';

const BOARD_COMPONENT_REPORT_TYPES = {
  Funnel: 'funnel',
  Goal: 'goal',
} as const;

function getExpectedBoardReportType(componentType?: string) {
  return componentType && componentType in BOARD_COMPONENT_REPORT_TYPES
    ? BOARD_COMPONENT_REPORT_TYPES[componentType as keyof typeof BOARD_COMPONENT_REPORT_TYPES]
    : null;
}

async function isValidBoardReportReference(
  board: { type?: string; parameters?: BoardParameters },
  component: BoardComponentConfig,
  reportCache: Map<string, ReturnType<typeof getReport>>,
) {
  const expectedReportType = getExpectedBoardReportType(component.type);

  if (!expectedReportType) {
    return true;
  }

  const reportId = component.props?.reportId;

  if (reportId == null || reportId === '') {
    return true;
  }

  if (typeof reportId !== 'string') {
    return false;
  }

  const entity = getResolvedComponentEntity(board, component);

  if (entity.entityType !== BOARD_ENTITY_TYPES.website || !entity.entityId) {
    return false;
  }

  const reportPromise = reportCache.get(reportId) ?? getReport(reportId);
  reportCache.set(reportId, reportPromise);

  const report = await reportPromise;

  return !!report && report.type === expectedReportType && report.websiteId === entity.entityId;
}

async function checkBoardEntityAccess(check: Promise<boolean>) {
  try {
    return await check;
  } catch {
    return false;
  }
}

export async function canViewBoardEntities(
  auth: Auth,
  type: string | undefined,
  parameters: BoardParameters = {},
) {
  const { websiteIds, pixelIds, linkIds } = getBoardEntityIds({ type, parameters });
  const userOnlyAuth: Auth = { user: auth.user };
  const checks = [
    ...websiteIds.map(id => checkBoardEntityAccess(canViewWebsite(userOnlyAuth, id))),
    ...pixelIds.map(id => checkBoardEntityAccess(canViewPixel(userOnlyAuth, id))),
    ...linkIds.map(id => checkBoardEntityAccess(canViewLink(userOnlyAuth, id))),
  ];

  const results = await Promise.all(checks);

  return results.every(Boolean);
}

export async function hasValidBoardReports(
  type: string | undefined,
  parameters: BoardParameters = {},
) {
  const board = { type, parameters };
  const reportCache = new Map<string, ReturnType<typeof getReport>>();

  for (const row of parameters.rows ?? []) {
    for (const column of row.columns ?? []) {
      const component = column.component;
      if (!component) {
        continue;
      }

      if (!(await isValidBoardReportReference(board, component, reportCache))) {
        return false;
      }
    }
  }

  return true;
}

export async function stripInvalidBoardReports(
  type: string | undefined,
  parameters: BoardParameters = {},
) {
  const board = { type, parameters };
  const reportCache = new Map<string, ReturnType<typeof getReport>>();
  let hasChanges = false;

  const rows = await Promise.all(
    (parameters.rows ?? []).map(async row => {
      const columns = await Promise.all(
        row.columns.map(async column => {
          const component = column.component;

          if (!component || (await isValidBoardReportReference(board, component, reportCache))) {
            return column;
          }

          hasChanges = true;

          const { reportId: _reportId, ...nextProps } = component.props ?? {};

          return {
            ...column,
            component: {
              ...component,
              props: Object.keys(nextProps).length > 0 ? nextProps : undefined,
            },
          };
        }),
      );

      return {
        ...row,
        columns,
      };
    }),
  );

  if (!hasChanges) {
    return parameters;
  }

  return {
    ...parameters,
    rows,
  };
}

export async function canViewBoard({ user, shareToken }: Auth, boardId: string) {
  if (user?.isAdmin) {
    return true;
  }

  if (shareToken?.boardId === boardId) {
    return true;
  }

  if (!user) {
    return false;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return !!teamUser;
  }

  return false;
}

export async function canUpdateBoard({ user }: Auth, boardId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteUpdate);
  }

  return false;
}

export async function canDeleteBoard({ user }: Auth, boardId: string) {
  if (!user) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  const board = await getBoard(boardId);

  if (!board) {
    return false;
  }

  if (board.userId) {
    return user.id === board.userId;
  }

  if (board.teamId) {
    const teamUser = await getTeamUser(board.teamId, user.id);

    return teamUser && hasPermission(teamUser.role, PERMISSIONS.websiteDelete);
  }

  return false;
}
