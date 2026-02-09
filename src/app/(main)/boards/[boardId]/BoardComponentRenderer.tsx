import { Column, Text } from '@umami/react-zen';
import type { BoardComponentConfig } from '@/lib/types';
import { getComponentDefinition } from '../boardComponentRegistry';

export function BoardComponentRenderer({
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
