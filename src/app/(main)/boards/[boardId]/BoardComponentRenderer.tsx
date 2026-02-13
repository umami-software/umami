import { Column, Text } from '@umami/react-zen';
import { memo } from 'react';
import type { BoardComponentConfig } from '@/lib/types';
import { getComponentDefinition } from '../boardComponentRegistry';

function BoardComponentRendererComponent({
  config,
  websiteId,
}: {
  config: BoardComponentConfig;
  websiteId: string;
}) {
  const definition = getComponentDefinition(config.type);

  if (!definition) {
    return (
      <Column alignItems="center" justifyContent="center" width="100%" height="100%">
        <Text color="muted">Unknown component: {config.type}</Text>
      </Column>
    );
  }

  const Component = definition.component;

  return <Component websiteId={websiteId} {...config.props} />;
}

export const BoardComponentRenderer = memo(
  BoardComponentRendererComponent,
  (prevProps, nextProps) =>
    prevProps.websiteId === nextProps.websiteId && prevProps.config === nextProps.config,
);

BoardComponentRenderer.displayName = 'BoardComponentRenderer';
