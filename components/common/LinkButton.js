import Link from 'next/link';
import { Icon, Icons, Text } from 'react-basics';
import styles from './LinkButton.module.css';

export default function LinkButton({ href, icon, children }) {
  return (
    <Link className={styles.button} href={href}>
      <Icon>{icon || <Icons.ArrowRight />}</Icon>
      <Text>{children}</Text>
    </Link>
  );
}
