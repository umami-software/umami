import { Column, Heading, Row, Text } from '@umami/react-zen';
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
    <Panel height="100%">
      {showBadge ? (
        <Row justifyContent={title ? 'space-between' : 'flex-end'} alignItems="center">
          {title && <Heading>{title}</Heading>}
          <BoardEntityBadge {...entityBadge} />
        </Row>
      ) : (
        title && <Heading>{title}</Heading>
      )}
      {description && <Text color="muted">{description}</Text>}
      <Column width="100%" height="100%" style={{ minHeight: 0 }}>
        <Column width="100%" flexGrow={1} style={{ minHeight: 0 }}>
          <BoardComponentRenderer config={component} websiteId={entityId} />
        </Column>
      </Column>
    </Panel>
  );
}
