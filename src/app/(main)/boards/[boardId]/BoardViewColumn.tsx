import { Column, Heading, Row, Text } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard } from '@/components/hooks';
import { getBoardType, getResolvedComponentEntity, isOpenBoardType } from '@/lib/boards';
import type { BoardComponentConfig, BoardRowFilters } from '@/lib/types';
import { BoardEntityBadge } from '../BoardEntityBadge';
import { getComponentDefinition } from '../boardComponentRegistry';
import { useBoardEntityBadgeProps } from '../useBoardEntityBadgeProps';
import { BoardComponentRenderer } from './BoardComponentRenderer';
import { BoardRowFilterIndicator } from './BoardRowFilterIndicator';

export function BoardViewColumn({
  component,
  showEntityBadge = true,
  rowFilters,
  filterWebsiteId,
}: {
  component?: BoardComponentConfig;
  showEntityBadge?: boolean;
  /** The row's filters, passed only when they scope this column. */
  rowFilters?: BoardRowFilters;
  filterWebsiteId?: string;
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
  const filterIndicator = rowFilters ? (
    <BoardRowFilterIndicator rowFilters={rowFilters} websiteId={filterWebsiteId} />
  ) : null;
  const hasHeaderAccessory = showBadge || !!filterIndicator;

  return (
    <Panel height="100%">
      {hasHeaderAccessory ? (
        <Row justifyContent={title ? 'space-between' : 'flex-end'} alignItems="center" gap="2">
          {title && <Heading>{title}</Heading>}
          <Row alignItems="center" gap="2">
            {filterIndicator}
            {showBadge && <BoardEntityBadge {...entityBadge} />}
          </Row>
        </Row>
      ) : (
        title && <Heading>{title}</Heading>
      )}
      {description && <Text color="muted">{description}</Text>}
      <Column width="100%" height="100%" style={{ minHeight: 0 }}>
        <Column width="100%" flexGrow={1} style={{ minHeight: 0 }}>
          <BoardComponentRenderer config={component} websiteId={entityId} entityType={entityType} />
        </Column>
      </Column>
    </Panel>
  );
}
