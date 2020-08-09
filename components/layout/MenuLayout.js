import React from 'react';
import classNames from 'classnames';
import Menu from 'components/common/Menu';
import styles from './MenuLayout.module.css';

export default function MenuLayout({
  menu,
  selectedOption,
  onMenuSelect,
  className,
  menuClassName,
  contentClassName,
  optionClassName,
  children,
}) {
  return (
    <div className={classNames(styles.container, className)}>
      <Menu
        options={menu}
        selectedOption={selectedOption}
        className={classNames(styles.menu, menuClassName)}
        selectedClassName={styles.selected}
        optionClassName={classNames(styles.option, optionClassName)}
        onSelect={onMenuSelect}
      />
      <div className={classNames(styles.content, contentClassName)}>{children}</div>
    </div>
  );
}
