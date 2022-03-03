import React from 'react';
import { useTransition, animated } from 'react-spring';
import useTheme from 'hooks/useTheme';
import Sun from 'assets/sun.svg';
import Moon from 'assets/moon.svg';
import styles from './ThemeButton.module.css';
import Icon from '../common/Icon';

export default function ThemeButton() {
  const [theme, setTheme] = useTheme();

  const transitions = useTransition(theme, {
    initial: { opacity: 1 },
    from: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '20px' : '-20px'}) scale(0.5)`,
    },
    enter: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    leave: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '-20px' : '20px'}) scale(0.5)`,
    },
  });

  function handleClick() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <div className={styles.button} onClick={handleClick}>
      {transitions((styles, item) => (
        <animated.div key={item} style={styles}>
          <Icon icon={item === 'light' ? <Sun /> : <Moon />} />
        </animated.div>
      ))}
    </div>
  );
}
