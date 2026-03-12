import { Icon, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { Globe, Grid2x2, Link } from '@/components/icons';
import type { BoardEntityType } from '@/lib/boards';

const HOSTNAME_REGEX = /^(?:https?:\/\/)?(?:[^@\n]+@)?([^:/\n?=]+)/im;

function WebsiteIcon({ domain }: { domain?: string }) {
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    const match = domain.match(HOSTNAME_REGEX);
    const hostname = match?.[1];

    if (hostname) {
      return (
        <img
          src={`https://${hostname}/favicon.ico`}
          width={16}
          height={16}
          alt=""
          onError={() => setFailed(true)}
        />
      );
    }
  }

  return <Globe width={16} height={16} />;
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
