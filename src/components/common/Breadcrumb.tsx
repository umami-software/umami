import Link from 'next/link';
import { Flexbox, Icon, Icons, Text } from 'react-basics';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbProps {
  data: {
    url?: string;
    label: string;
  }[];
}

export function Breadcrumb({ data }: BreadcrumbProps) {
  return (
    <Flexbox alignItems="center" gap={3} className={styles.bar}>
      {data.map((a, i) => {
        return (
          <>
            {a.url ? (
              <Link href={a.url} className={styles.link}>
                <Text>{a.label}</Text>
              </Link>
            ) : (
              <Text>{a.label}</Text>
            )}
            {i !== data.length - 1 ? (
              <Icon rotate={270}>
                <Icons.ChevronDown />
              </Icon>
            ) : null}
          </>
        );
      })}
    </Flexbox>
  );
}

export default Breadcrumb;
