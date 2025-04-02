import classNames from 'classnames';
import { Button, Icon, useTheme } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import styles from './ThemeSetting.module.css';

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.buttons}>
      <Button
        className={classNames({ [styles.active]: theme === 'light' })}
        onPress={() => setTheme('light')}
      >
        <Icon>
          <Icons.Sun />
        </Icon>
      </Button>
      <Button
        className={classNames({ [styles.active]: theme === 'dark' })}
        onPress={() => setTheme('dark')}
      >
        <Icon>
          <Icons.Moon />
        </Icon>
      </Button>
    </div>
  );
}
