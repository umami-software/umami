import Link from 'next/link';
import { Flexbox, Icon, Icons, Text } from 'react-basics';
import styles from './Breadcrumb.module.css';
import { Fragment } from 'react';

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
          <Fragment key={i}>
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
          </Fragment>
        );
      })}
    </Flexbox>
  );
}

export default Breadcrumb;
