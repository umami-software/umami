import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from 'redux/actions/app';
import { getItem, setItem } from 'lib/web';
import { THEME_CONFIG } from 'lib/constants';
import { useEffect } from 'react';

export default function useTheme() {
  const theme = useSelector(state => state.app.theme || getItem(THEME_CONFIG) || 'light');
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
