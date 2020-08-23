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
      {items.map(item => (
        <Button
          key={item}
          className={classNames(styles.button, { [styles.selected]: selectedItem === item })}
          size={size}
          icon={icon}
          onClick={() => onClick(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
