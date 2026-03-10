import type { Board, BoardComponentConfig, BoardParameters } from './types';
import { isBoardComponentSupportedByEntityType } from './boardComponentCompatibility';

export const BOARD_TYPES = {
  dashboard: 'dashboard',
  mixed: 'mixed',
  website: 'website',
  pixel: 'pixel',
  link: 'link',
} as const;

export const BOARD_ENTITY_TYPES = {
  website: 'website',
  pixel: 'pixel',
  link: 'link',
} as const;

export type BoardType = (typeof BOARD_TYPES)[keyof typeof BOARD_TYPES];
export type BoardEntityType = (typeof BOARD_ENTITY_TYPES)[keyof typeof BOARD_ENTITY_TYPES];

const boardTypes = new Set<string>(Object.values(BOARD_TYPES));

export function getLegacyBoardType(parameters?: BoardParameters): BoardType {
  if (parameters?.pixelId) {
    return BOARD_TYPES.pixel;
  }

  if (parameters?.linkId) {
    return BOARD_TYPES.link;
  }

  if (parameters?.websiteId) {
    return BOARD_TYPES.website;
  }

  return BOARD_TYPES.mixed;
}

export function normalizeBoardType(type?: string): BoardType | undefined {
  if (type === 'open') {
    return BOARD_TYPES.mixed;
  }

  if (type && boardTypes.has(type)) {
    return type as BoardType;
  }

  return undefined;
}

export function getBoardType(
  board?: Pick<Board, 'type' | 'parameters'> | Partial<Board>,
  { coerceDashboard = false }: { coerceDashboard?: boolean } = {},
): BoardType {
  const type = board?.type;

  if (type === BOARD_TYPES.dashboard && coerceDashboard) {
    return getLegacyBoardType(board?.parameters);
  }

  const normalizedType = normalizeBoardType(type);

  if (normalizedType) {
    return normalizedType;
  }

  return getLegacyBoardType(board?.parameters);
}

export function isOpenBoardType(type?: string) {
  return type === BOARD_TYPES.mixed || type === BOARD_TYPES.dashboard || type === 'open';
}

export function requiresBoardEntity(type?: string) {
  return (
    type === BOARD_TYPES.website || type === BOARD_TYPES.pixel || type === BOARD_TYPES.link
  );
}

export function getBoardEntity(board?: Pick<Board, 'type' | 'parameters'> | Partial<Board>): {
  entityType?: BoardEntityType;
  entityId?: string;
} {
  const type = getBoardType(board);

  if (type === BOARD_TYPES.website) {
    return {
      entityType: BOARD_ENTITY_TYPES.website,
      entityId: board?.parameters?.websiteId,
    };
  }

  if (type === BOARD_TYPES.pixel) {
    return {
      entityType: BOARD_ENTITY_TYPES.pixel,
      entityId: board?.parameters?.pixelId,
    };
  }

  if (type === BOARD_TYPES.link) {
    return {
      entityType: BOARD_ENTITY_TYPES.link,
      entityId: board?.parameters?.linkId,
    };
  }

  return {};
}

export function getComponentEntity(config?: BoardComponentConfig): {
  entityType?: BoardEntityType;
  entityId?: string;
} {
  if (config?.entityType && config?.entityId) {
    return {
      entityType: config.entityType,
      entityId: config.entityId,
    };
  }

  if (config?.websiteId) {
    return {
      entityType: BOARD_ENTITY_TYPES.website,
      entityId: config.websiteId,
    };
  }

  return {};
}

export function getResolvedComponentEntity(
  board?: Pick<Board, 'type' | 'parameters'> | Partial<Board>,
  config?: BoardComponentConfig,
) {
  const boardEntity = getBoardEntity(board);

  if (boardEntity.entityId) {
    return boardEntity;
  }

  return getComponentEntity(config);
}

export function isBoardComponentSupported(
  componentType: string,
  entityType?: BoardEntityType,
) {
  return isBoardComponentSupportedByEntityType(componentType, entityType);
}

export function getFirstBoardComponentEntity(
  board?: Pick<Board, 'type' | 'parameters'> | Partial<Board>,
) {
  for (const row of board?.parameters?.rows ?? []) {
    for (const column of row.columns ?? []) {
      const entity = getComponentEntity(column.component);

      if (entity.entityId) {
        return entity;
      }
    }
  }

  return {};
}

export function getBoardWebsiteIds(
  board?: Pick<Board, 'type' | 'parameters'> | Partial<Board>,
): string[] {
  const ids = new Set<string>();
  const boardEntity = getBoardEntity(board);

  if (boardEntity.entityType === BOARD_ENTITY_TYPES.website && boardEntity.entityId) {
    ids.add(boardEntity.entityId);
  }

  if (board?.parameters?.websiteId) {
    ids.add(board.parameters.websiteId);
  }

  for (const row of board?.parameters?.rows ?? []) {
    for (const column of row.columns ?? []) {
      const entity = getComponentEntity(column.component);

      if (entity.entityType === BOARD_ENTITY_TYPES.website && entity.entityId) {
        ids.add(entity.entityId);
      }
    }
  }

  return [...ids];
}

export function clearBoardEntity(parameters: BoardParameters = {}): BoardParameters {
  const { websiteId, pixelId, linkId, ...rest } = parameters;

  return rest;
}

export function setBoardEntity(
  parameters: BoardParameters = {},
  type: BoardType,
  entityId?: string,
): BoardParameters {
  const next = clearBoardEntity(parameters);

  if (type === BOARD_TYPES.website && entityId) {
    next.websiteId = entityId;
  }

  if (type === BOARD_TYPES.pixel && entityId) {
    next.pixelId = entityId;
  }

  if (type === BOARD_TYPES.link && entityId) {
    next.linkId = entityId;
  }

  return next;
}
