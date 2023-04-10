import React from 'react';
import classNames from 'classnames';
import { useBreakpoint } from 'react-basics';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, children }) {
  const breakPoint = useBreakpoint();

  return (
    <div className={classNames(styles.header, { [styles[breakPoint]]: true })}>
      <div className={styles.title}>{title}</div>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
