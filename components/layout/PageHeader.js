import classNames from 'classnames';
import React from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({ title, children, className }) {
  return (
    <div className={classNames(styles.header, className)}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default PageHeader;
