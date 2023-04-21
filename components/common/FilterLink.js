import { Icon, Icons } from 'react-basics';
import classNames from 'classnames';
import Link from 'next/link';
import { safeDecodeURI } from 'next-basics';
import usePageQuery from 'hooks/usePageQuery';
import useMessages from 'hooks/useMessages';
import styles from './FilterLink.module.css';

export function FilterLink({ id, value, label, externalUrl }) {
  const { formatMessage, labels } = useMessages();
  const { resolveUrl, query } = usePageQuery();
  const active = query[id] !== undefined;
  const selected = query[id] === value;

  return (
    <div className={styles.row}>
      {!value && `(${label || formatMessage(labels.unknown)})`}
      {value && (
        <Link
          href={resolveUrl({ [id]: value })}
          className={classNames(styles.label, {
            [styles.inactive]: active && !selected,
            [styles.active]: active && selected,
          })}
          replace
        >
          {safeDecodeURI(label || value)}
        </Link>
      )}
      {externalUrl && (
        <a className={styles.link} href={externalUrl} target="_blank" rel="noreferrer noopener">
          <Icon className={styles.icon}>
            <Icons.External />
          </Icon>
        </a>
      )}
    </div>
  );
}

export default FilterLink;
