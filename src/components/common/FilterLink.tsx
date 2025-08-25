import { HTMLAttributes, ReactNode, useState } from 'react';
import Link from 'next/link';
import { Icon, Row, Text } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { ExternalLink } from '@/components/icons';

export interface FilterLinkProps extends HTMLAttributes<HTMLDivElement> {
  type: string;
  value: string;
  label?: string;
  icon?: ReactNode;
  externalUrl?: string;
}

export function FilterLink({ type, value, label, externalUrl, icon }: FilterLinkProps) {
  const [showLink, setShowLink] = useState(false);
  const { formatMessage, labels } = useMessages();
  const { updateParams, query } = useNavigation();
  const active = query[type] !== undefined;
  const selected = query[type] === value;

  return (
    <Row
      alignItems="center"
      gap
      fontWeight={active && selected ? 'bold' : undefined}
      color={active && !selected ? 'muted' : undefined}
      onMouseOver={() => setShowLink(true)}
      onMouseOut={() => setShowLink(false)}
    >
      {icon}
      {!value && `(${label || formatMessage(labels.unknown)})`}
      {value && (
        <Text title={label || value} truncate>
          <Link href={updateParams({ [type]: `eq.${value}` })} replace>
            {label || value}
          </Link>
        </Text>
      )}
      {externalUrl && showLink && (
        <a href={externalUrl} target="_blank" rel="noreferrer noopener">
          <Icon color="muted">
            <ExternalLink />
          </Icon>
        </a>
      )}
    </Row>
  );
}
