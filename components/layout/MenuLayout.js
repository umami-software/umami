import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import NavMenu from 'components/common/NavMenu';
import styles from './MenuLayout.module.css';

export default function MenuLayout({
  menu,
  selectedOption,
  className,
  menuClassName,
  contentClassName,
  children,
  replace = false,
}) {
  const router = useRouter();

  function handleSelect(url) {
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }

  return (
    <div className={classNames(styles.container, className, 'row')}>
      <NavMenu
        options={menu}
        selectedOption={selectedOption}
        className={classNames(styles.menu, menuClassName, 'col-12 col-lg-2')}
        onSelect={handleSelect}
      />
      <div className={classNames(styles.content, contentClassName, 'col-12 col-lg-10')}>
        {children}
      </div>
    </div>
  );
}
