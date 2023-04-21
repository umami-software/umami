import classNames from 'classnames';
import { Button, Icon } from 'react-basics';
import useTheme from 'hooks/useTheme';
import Sun from 'assets/sun.svg';
import Moon from 'assets/moon.svg';
import styles from './ThemeSetting.module.css';

export function ThemeSetting() {
  const [theme, setTheme] = useTheme();

  return (
    <div className={styles.buttons}>
      <Button
        className={classNames({ [styles.active]: theme === 'light' })}
        onClick={() => setTheme('light')}
      >
        <Icon>
          <Sun />
        </Icon>
      </Button>
      <Button
        className={classNames({ [styles.active]: theme === 'dark' })}
        onClick={() => setTheme('dark')}
      >
        <Icon>
          <Moon />
        </Icon>
      </Button>
    </div>
  );
}

export default ThemeSetting;
