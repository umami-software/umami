import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Icon } from 'react-basics';
import styles from './PageHeader.module.css';

export function PageHeader({
  title,
  icon,
  className,
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={classNames(styles.header, className)}>
      {icon && (
        <Icon size="lg" className={styles.icon}>
          {icon}
        </Icon>
      )}
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default PageHeader;
