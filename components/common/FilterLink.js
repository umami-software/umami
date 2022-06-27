import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import usePageQuery from 'hooks/usePageQuery';
import { safeDecodeURI } from 'lib/url';
import Icon from './Icon';
import External from 'assets/arrow-up-right-from-square.svg';
import styles from './FilterLink.module.css';

export default function FilterLink({ id, value, label, externalUrl }) {
  const { resolve, query } = usePageQuery();
  const active = query[id] !== undefined;
  const selected = query[id] === value;

  return (
    <div className={styles.row}>
      <Link href={resolve({ [id]: value })} replace>
        <a
          className={classNames(styles.label, {
            [styles.inactive]: active && !selected,
            [styles.active]: active && selected,
          })}
        >
          {safeDecodeURI(label || value)}
        </a>
      </Link>
      {externalUrl && (
        <a href={externalUrl} target="_blank" rel="noreferrer noopener" className={styles.link}>
          <Icon icon={<External />} className={styles.icon} />
        </a>
      )}
    </div>
  );
}
