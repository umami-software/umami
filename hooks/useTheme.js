import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from 'redux/actions/app';
import { getItem, setItem } from 'lib/web';
import { THEME_CONFIG } from 'lib/constants';
import { useEffect } from 'react';

export default function useTheme() {
  const defaultTheme =
    typeof window !== 'undefined'
      ? window?.matchMedia('(prefers-color-scheme: dark)')?.matches
        ? 'dark'
        : 'light'
      : 'light';
  const theme = useSelector(state => state.app.theme || getItem(THEME_CONFIG) || defaultTheme);
  const dispatch = useDispatch();

  function saveTheme(value) {
    setItem(THEME_CONFIG, value);
    dispatch(setTheme(value));
  }

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return [theme, saveTheme];
}
