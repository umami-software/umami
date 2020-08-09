import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './MenuLayout.module.css';

export default function MenuLayout({ menu, selectedOption, onMenuSelect, children }) {
  const [option, setOption] = useState(selectedOption);

  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        {menu.map(item => (
          <div
            className={classNames(styles.option, { [styles.active]: option === item })}
            onClick={() => setOption(item)}
          >
            {item}
          </div>
        ))}
      </div>
      <div className={styles.content}>
        {typeof children === 'function' ? children(option) : children}
      </div>
    </div>
  );
}
