import { Box, Column } from '@umami/react-zen';
import { Panel } from '@/components/common/Panel';
import { useBoard } from '@/components/hooks';
import type { BoardComponentConfig } from '@/lib/types';
import { getComponentDefinition } from '../boardComponentRegistry';
import { BoardComponentRenderer } from './BoardComponentRenderer';

export function BoardViewColumn({ component }: { component?: BoardComponentConfig }) {
  const { board } = useBoard();
  const websiteId = board?.parameters?.websiteId;

  if (!component || !websiteId) {
    return null;
  }

  const title = component.title || getComponentDefinition(component.type)?.name;
  const description = component.description;

  return (
    <Panel title={title} description={description} height="100%">
      <Column width="100%" height="100%">
        <Box width="100%" overflow="auto">
          <BoardComponentRenderer config={component} websiteId={websiteId} />
        </Box>
      </Column>
    </Panel>
  );
}
