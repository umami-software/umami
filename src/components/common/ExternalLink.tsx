'use client';
import { Icon, Row, Text, useToast } from '@umami/react-zen';
import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { useMessages } from '@/components/hooks';
import { ExternalLink as LinkIcon } from '@/components/icons';
import styles from './ExternalLink.module.css';

export function ExternalLink({
  href,
  children,
  ...props
}: Omit<LinkProps, 'href'> & { href: string; children: ReactNode }) {
  const { toast } = useToast();
  const { formatMessage, labels } = useMessages();

  const handleCopy = () => {
    navigator.clipboard.writeText(href);
    toast(formatMessage(labels.copied));
  };

  return (
    <Row alignItems="center" overflow="hidden" gap>
      <Text title={href} truncate>
        <span onClick={handleCopy} className={styles.link}>
          {children}
        </span>
      </Text>
      <Link {...props} href={href} target="_blank" className={styles.iconLink}>
        <Icon>
          <LinkIcon />
        </Icon>
      </Link>
    </Row>
  );
}
