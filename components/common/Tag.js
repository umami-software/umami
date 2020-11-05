import React from 'react';
import classNames from 'classnames';
import styles from './Tag.module.css';

export default function Tag({ className, children }) {
  return <span className={classNames(styles.tag, className)}>{children}</span>;
}
