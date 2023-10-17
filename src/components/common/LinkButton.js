import classNames from 'classnames';
import Link from 'next/link';
import { useLocale } from 'components/hooks';
import styles from './LinkButton.module.css';

export function LinkButton({ href, className, variant, scroll = true, children }) {
  const { dir } = useLocale();

  return (
    <Link
      className={classNames(styles.button, className, { [styles[variant]]: true })}
      href={href}
      dir={dir}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}

export default LinkButton;
