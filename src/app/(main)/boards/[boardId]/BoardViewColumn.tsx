import { Box, Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard } from '@/components/hooks';
import { getResolvedComponentEntity } from '@/lib/boards';
import type { BoardComponentConfig } from '@/lib/types';
import { getComponentDefinition } from '../boardComponentRegistry';
import { BoardComponentRenderer } from './BoardComponentRenderer';

export function BoardViewColumn({ component }: { component?: BoardComponentConfig }) {
  const { board } = useBoard();
  const definition = component ? getComponentDefinition(component.type) : undefined;
  const { entityId } = getResolvedComponentEntity(board, component);

  if (!component || (!entityId && definition?.requiresWebsite !== false)) {
    return null;
  }

  const title = component.title;
  const description = component.description;

  return (
    <Panel title={title} description={description} height="100%">
      <Column width="100%" height="100%" style={{ minHeight: 0 }}>
        <Box width="100%" flexGrow={1} style={{ minHeight: 0 }}>
          <BoardComponentRenderer config={component} websiteId={entityId} />
        </Box>
      </Column>
    </Panel>
  );
}
