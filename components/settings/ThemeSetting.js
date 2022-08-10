import classNames from 'classnames';
import Button from 'components/common/Button';
import useTheme from 'hooks/useTheme';
import Sun from 'assets/sun.svg';
import Moon from 'assets/moon.svg';
import styles from './ThemeSetting.module.css';

export default function ThemeSetting() {
  const [theme, setTheme] = useTheme();

  return (
    <div className={styles.buttons}>
      <Button
        className={classNames({ [styles.active]: theme === 'light' })}
        icon={<Sun />}
        onClick={() => setTheme('light')}
      />
      <Button
        className={classNames({ [styles.active]: theme === 'dark' })}
        icon={<Moon />}
        onClick={() => setTheme('dark')}
      />
    </div>
  );
}
