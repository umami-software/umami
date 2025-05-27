import { Fragment } from 'react';
import Link from 'next/link';
import { Row, Icon, Text } from '@umami/react-zen';
import { Chevron } from '@/components/icons';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbProps {
  data: {
    url?: string;
    label: string;
  }[];
}

export function Breadcrumb({ data }: BreadcrumbProps) {
  return (
    <Row alignItems="center" gap className={styles.bar}>
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
                <Chevron />
              </Icon>
            ) : null}
          </Fragment>
        );
      })}
    </Row>
  );
}
