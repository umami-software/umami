import { useTransition, animated } from '@react-spring/web';
import { Button, Icon } from 'react-basics';
import { useTheme } from '@/components/hooks';
import Icons from '@/components/icons';
import styles from './ThemeButton.module.css';

export function ThemeButton() {
  const { theme, saveTheme } = useTheme();

  const transitions = useTransition(theme, {
    initial: { opacity: 1 },
    from: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '20px' : '-20px'}) scale(0.5)`,
    },
    enter: { opacity: 1, transform: 'translateY(0px) scale(1.0)' },
    leave: {
      opacity: 0,
      transform: `translateY(${theme === 'light' ? '-20px' : '20px'}) scale(0.5)`,
    },
  });

  function handleClick() {
    saveTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <Button variant="quiet" className={styles.button} onClick={handleClick}>
      {transitions((style, item) => (
        <animated.div key={item} style={style}>
          <Icon>{item === 'light' ? <Icons.Sun /> : <Icons.Moon />}</Icon>
        </animated.div>
      ))}
    </Button>
  );
}

export default ThemeButton;
