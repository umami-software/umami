import classNames from 'classnames';
import Link from 'next/link';
import { useLocale } from 'components/hooks';
import styles from './LinkButton.module.css';

export function LinkButton({ href, className, children }) {
  const { dir } = useLocale();

  return (
    <Link className={classNames(styles.button, className)} href={href} dir={dir}>
      {children}
    </Link>
  );
}

export default LinkButton;
