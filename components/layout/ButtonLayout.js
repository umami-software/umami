import React from 'react';
import classNames from 'classnames';
import styles from './ButtonLayout.module.css';

export default function ButtonLayout({ className, children }) {
  return <div className={classNames(styles.buttons, className)}>{children}</div>;
}
