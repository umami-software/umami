import { Icon, Row, Text } from '@umami/react-zen';
import { Globe, Grid2x2, Link } from '@/components/icons';
import type { BoardEntityType } from '@/lib/boards';

export function BoardEntityBadge({ type, name }: { type: BoardEntityType; name: string }) {
  return (
    <Row padding borderRadius="full" backgroundColor="surface-base" border gap="2">
      <Icon>
        {type === 'pixel' ? <Grid2x2 /> : type === 'link' ? <Link /> : <Globe />}
      </Icon>
      <Text size="sm">{name}</Text>
    </Row>
  );
}
