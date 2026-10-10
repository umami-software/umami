import { Icon, Row, Text } from '@umami/react-zen';
import { type HTMLAttributes, type ReactNode, useState } from 'react';
import Link from '@/components/common/Link';
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
  const { t, labels } = useMessages();
  const { updateParams, query } = useNavigation();
  const active = query[type] !== undefined;
  const selected = query[type] === value;

  return (
    <Row
      alignItems="center"
      gap
      color={active && !selected ? 'muted' : undefined}
      onMouseOver={() => setShowLink(true)}
      onMouseOut={() => setShowLink(false)}
    >
      {icon}
      {!value && <Text weight={active && selected ? 'bold' : undefined}>({label || t(labels.unknown)})</Text>}
      {value && (
        <Text title={label || value} truncate weight={active && selected ? 'bold' : undefined}>
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
