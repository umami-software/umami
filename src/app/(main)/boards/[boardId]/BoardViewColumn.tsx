import { Box, Column, Row } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard } from '@/components/hooks';
import { getBoardType, getResolvedComponentEntity, isOpenBoardType } from '@/lib/boards';
import type { BoardComponentConfig } from '@/lib/types';
import { BoardEntityBadge } from '../BoardEntityBadge';
import { getComponentDefinition } from '../boardComponentRegistry';
import { useBoardEntityBadgeProps } from '../useBoardEntityBadgeProps';
import { BoardComponentRenderer } from './BoardComponentRenderer';

export function BoardViewColumn({
  component,
  showEntityBadge = true,
}: {
  component?: BoardComponentConfig;
  showEntityBadge?: boolean;
}) {
  const { board } = useBoard();
  const boardType = getBoardType(board);
  const definition = component ? getComponentDefinition(component.type) : undefined;
  const { entityType, entityId } = getResolvedComponentEntity(board, component);
  const entityBadge = useBoardEntityBadgeProps(entityType, entityId, showEntityBadge);

  if (!component || (!entityId && definition?.requiresWebsite !== false)) {
    return null;
  }

  const title = component.title;
  const description = component.description;

  const showBadge = showEntityBadge && isOpenBoardType(boardType) && !!entityBadge;

  return (
    <Panel title={title} description={description} height="100%" position="relative">
      {showBadge && (
        title ? (
          <Box position="absolute" top="12px" right="12px" zIndex={100}>
            <BoardEntityBadge {...entityBadge} />
          </Box>
        ) : (
          <Row justifyContent="flex-end">
            <BoardEntityBadge {...entityBadge} />
          </Row>
        )
      )}
      <Column width="100%" height="100%" style={{ minHeight: 0 }}>
        <Box width="100%" flexGrow={1} style={{ minHeight: 0 }}>
          <BoardComponentRenderer config={component} websiteId={entityId} />
        </Box>
      </Column>
    </Panel>
  );
}
