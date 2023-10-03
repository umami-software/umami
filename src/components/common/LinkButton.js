import classNames from 'classnames';
import Link from 'next/link';
import { Icon, Icons, Text } from 'react-basics';
import styles from './LinkButton.module.css';
import { useLocale } from 'components/hooks';

export function LinkButton({ href, icon, className, children }) {
  const { dir } = useLocale();

  return (
    <Link className={classNames(styles.button, className)} href={href}>
      <Icon rotate={dir === 'rtl' ? 0 : 180}>{icon || <Icons.ArrowRight />}</Icon>
      <Text>{children}</Text>
    </Link>
  );
}

export default LinkButton;
