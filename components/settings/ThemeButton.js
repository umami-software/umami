import React from 'react';
import Button from 'components/common/Button';
import useTheme from 'hooks/useTheme';

export default function ThemeButton() {
  const [theme, setTheme] = useTheme();

  function handleClick() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return <Button onClick={handleClick}>{theme}</Button>;
}
