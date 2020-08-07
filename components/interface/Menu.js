import React from 'react';
import classNames from 'classnames';
import styles from './Menu.module.css';

export default function Menu({ options = [], className, align = 'left', onSelect = () => {} }) {
  return (
    <div
      className={classNames(styles.menu, className, {
        [styles.left]: align === 'left',
        [styles.right]: align === 'right',
      })}
    >
      {options.map(({ label, value, className: optionClassName }) => (
        <div
          key={value}
          className={classNames(styles.option, optionClassName)}
          onClick={e => onSelect(value, e)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
