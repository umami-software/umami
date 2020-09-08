import React from 'react';
import classNames from 'classnames';
import Button from './Button';
import styles from './ButtonGroup.module.css';

export default function ButtonGroup({
  items = [],
  selectedItem,
  className,
  size,
  icon,
  onClick = () => {},
}) {
  return (
    <div className={classNames(styles.group, className)}>
      {items.map(item => {
        const { label, value } = item;
        return (
          <Button
            key={value}
            className={classNames(styles.button, { [styles.selected]: selectedItem === value })}
            size={size}
            icon={icon}
            onClick={() => onClick(value)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
