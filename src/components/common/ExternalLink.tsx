import { Icon, Row, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import Link, { type LinkProps } from '@/components/common/Link';
import { ExternalLink as LinkIcon } from '@/components/icons';

export function ExternalLink({
  href,
  children,
  prefetch = false,
  ...props
}: LinkProps & { href: string; children: ReactNode }) {
  return (
    <Row alignItems="center" overflow="hidden" gap>
      <Text title={href} truncate>
        <Link {...props} href={href} target="_blank" prefetch={prefetch}>
          {children}
        </Link>
      </Text>
      <Icon size="sm" strokeColor="muted">
        <LinkIcon />
      </Icon>
    </Row>
  );
}
