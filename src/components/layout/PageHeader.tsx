import classNames from 'classnames';
import React, { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className={classNames(styles.header, className)}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default PageHeader;
