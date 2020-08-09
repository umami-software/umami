import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './MenuLayout.module.css';

export default function MenuLayout({
  menu,
  selectedOption,
  onMenuSelect,
  className,
  menuClassName,
  contentClassName,
  children,
}) {
  function handleMenuSelect(option) {
    onMenuSelect(option);
  }

  return (
    <div className={classNames(styles.container, className)}>
      <div className={classNames(styles.menu, menuClassName)}>
        {menu.map(option =>
          option ? (
            <div
              className={classNames(styles.option, { [styles.active]: option === selectedOption })}
              onClick={() => handleMenuSelect(option)}
            >
              {option}
            </div>
          ) : null,
        )}
      </div>
      <div className={classNames(styles.content, contentClassName)}>{children}</div>
    </div>
  );
}
