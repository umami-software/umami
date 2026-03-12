import { Icon, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { Favicon } from '@/components/common/Favicon';
import { Globe, Grid2x2, Link } from '@/components/icons';
import type { BoardEntityType } from '@/lib/boards';

function WebsiteIcon({ domain }: { domain?: string }) {
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return <Favicon domain={domain} onError={() => setFailed(true)} />;
  }

  return <Globe />;
}

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
          <WebsiteIcon domain={domain} />
        )}
      </Icon>
      <Text size="sm">{name}</Text>
    </Row>
  );
}
