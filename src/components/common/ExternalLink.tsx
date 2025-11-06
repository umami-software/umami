import Link from 'next/link';
import { Icon, Row, Text } from '@umami/react-zen';
import { ExternalLink as LinkIcon } from '@/components/icons';

export function ExternalLink({ href, children, ...props }) {
  return (
    <Row alignItems="center" overflow="hidden" gap>
      <Text title={href} truncate>
        <Link {...props} href={href} target="_blank">
          {children}
        </Link>
      </Text>
      <Icon size="sm" strokeColor="muted">
        <LinkIcon />
      </Icon>
    </Row>
  );
}
