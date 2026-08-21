import { Icon, Row, Text } from '@umami/react-zen';
import { Favicon } from '@/components/common/Favicon';
import { Grid2x2, Link as LinkIcon } from '@/components/icons';
import type { BoardEntityType } from '@/lib/boards';
import Link from 'next/link';

export function BoardEntityBadge({
  id,
  type,
  name,
  domain,
}: {
  id: string;
  type: BoardEntityType;
  name: string;
  domain?: string;
}) {
  return (
    <Link href={`/${type}s/${id}`}>
      <Row padding borderRadius="full" backgroundColor="surface-base" border gap="2">
        <Icon>
          {type === 'pixel' ? (
            <Grid2x2 />
          ) : type === 'link' ? (
            <LinkIcon />
          ) : (
            <Favicon domain={domain} />
          )}
        </Icon>
        <Text size="sm">{name}</Text>
      </Row>
    </Link>
  );
}
