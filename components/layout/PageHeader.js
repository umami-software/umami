import React from 'react';
import classNames from 'classnames';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, children, className, style }) {
  return (
    <div className={classNames(styles.header, className)} style={style}>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
}
