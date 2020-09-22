import React from 'react';
import classNames from 'classnames';
import styles from './PageHeader.module.css';

export default function PageHeader({ children, className }) {
  return <div className={classNames(styles.header, className)}>{children}</div>;
}
