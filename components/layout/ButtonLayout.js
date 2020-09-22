import React from 'react';
import classNames from 'classnames';
import styles from './ButtonLayout.module.css';

export default function ButtonLayout({ className, children, align = 'center' }) {
  return (
    <div
      className={classNames(styles.buttons, className, {
        [styles.left]: align === 'left',
        [styles.center]: align === 'center',
        [styles.right]: align === 'right',
      })}
    >
      {children}
    </div>
  );
}
