import { ReactNode } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { Icon, Icons } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import styles from './FilterLink.module.css';

export interface FilterLinkProps {
  id: string;
  value: string;
  label?: string;
  externalUrl?: string;
  className?: string;
  children?: ReactNode;
}

export function FilterLink({
  id,
  value,
  label,
  externalUrl,
  children,
  className,
}: FilterLinkProps) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl, query } = useNavigation();
  const active = query[id] !== undefined;
  const selected = query[id] === value;

  return (
    <div
      className={classNames(styles.row, className, {
        [styles.inactive]: active && !selected,
        [styles.active]: active && selected,
      })}
    >
      {children}
      {!value && `(${label || formatMessage(labels.unknown)})`}
      {value && (
        <Link href={renderUrl({ [id]: `eq.${value}` })} className={styles.label} replace>
          {label || value}
        </Link>
      )}
      {externalUrl && (
        <a className={styles.link} href={externalUrl} target="_blank" rel="noreferrer noopener">
          <Icon className={styles.icon}>
            <Icons.ExternalLink />
          </Icon>
        </a>
      )}
    </div>
  );
}
