import classNames from 'classnames';
import { Button, Icon } from '@umami/react-zen';
import { useTheme } from '@/components/hooks';
import { Icons } from '@/components/icons';
import styles from './ThemeSetting.module.css';

export function ThemeSetting() {
  const { theme, saveTheme } = useTheme();

  return (
    <div className={styles.buttons}>
      <Button
        className={classNames({ [styles.active]: theme === 'light' })}
        onClick={() => saveTheme('light')}
      >
        <Icon>
          <Icons.Sun />
        </Icon>
      </Button>
      <Button
        className={classNames({ [styles.active]: theme === 'dark' })}
        onClick={() => saveTheme('dark')}
      >
        <Icon>
          <Icons.Moon />
        </Icon>
      </Button>
    </div>
  );
}
