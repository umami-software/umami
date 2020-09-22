import React from 'react';
import { useTransition, animated } from 'react-spring';
import Button from 'components/common/Button';
import useTheme from 'hooks/useTheme';
import Sun from 'assets/sun.svg';
import Moon from 'assets/moon.svg';
import styles from './ThemeButton.module.css';
import Icon from '../common/Icon';

export default function ThemeButton() {
  const [theme, setTheme] = useTheme();

  const transitions = useTransition(theme, theme => theme, {
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
    <Button className={styles.button} variant="light" onClick={handleClick}>
      {transitions.map(({ item, key, props }) =>
        item === 'light' ? (
          <animated.div key={key} style={props}>
            <Icon icon={<Sun />} />
          </animated.div>
        ) : (
          <animated.div key={key} style={props}>
            <Icon icon={<Moon />} />
          </animated.div>
        ),
      )}
    </Button>
  );
}
