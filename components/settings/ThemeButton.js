import React from 'react';
import Button from 'components/common/Button';
import useTheme from 'hooks/useTheme';
import ToggleOn from 'assets/toggle-on.svg';
import ToggleOff from 'assets/toggle-off.svg';

export default function ThemeButton() {
  const [theme, setTheme] = useTheme();

  function handleClick() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <Button
      icon={theme === 'light' ? <ToggleOff /> : <ToggleOn />}
      size="large"
      variant="light"
      onClick={handleClick}
    />
  );
}
