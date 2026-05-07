import { Icon, Row, Text } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { Grid2x2, Link } from '@/components/icons';
import type { BoardEntityType } from '@/lib/boards';

export function BoardEntityBadge({
  type,
  name,
  domain,
}: {
  type: BoardEntityType;
  name: string;
  domain?: string;
}) {
  return (
    <Row padding borderRadius="full" backgroundColor="surface-base" border gap="2">
      <Icon>
        {type === 'pixel' ? (
          <Grid2x2 />
        ) : type === 'link' ? (
          <Link />
        ) : (
          <Favicon domain={domain} />
        )}
      </Icon>
      <Text size="sm">{name}</Text>
    </Row>
  );
}
