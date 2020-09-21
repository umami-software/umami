import React from 'react';
import classNames from 'classnames';
import styles from './Menu.module.css';

export default function Menu({
  options = [],
  selectedOption,
  className,
  float,
  align = 'left',
  optionClassName,
  selectedClassName,
  onSelect = () => {},
}) {
  return (
    <div
      className={classNames(styles.menu, className, {
        [styles.float]: float,
        [styles.top]: float === 'top',
        [styles.bottom]: float === 'bottom',
        [styles.left]: align === 'left',
        [styles.right]: align === 'right',
      })}
    >
      {options
        .filter(({ hidden }) => !hidden)
        .map(option => {
          const { label, value, className: customClassName, render, divider } = option;

          return render ? (
            render(option)
          ) : (
            <div
              key={value}
              className={classNames(styles.option, optionClassName, customClassName, {
                [selectedClassName]: selectedOption === option,
                [styles.selected]: selectedOption === option,
                [styles.divider]: divider,
              })}
              onClick={e => onSelect(value, e)}
            >
              {label}
            </div>
          );
        })}
    </div>
  );
}
