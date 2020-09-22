import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from 'redux/actions/app';
import { setItem } from 'lib/web';
import { LOCALE_CONFIG } from 'lib/constants';

export default function useLocale() {
  const locale = useSelector(state => state.app.locale);
  const dispatch = useDispatch();

  function saveLocale(value) {
    setItem(LOCALE_CONFIG, value);
    dispatch(setLocale(value));
  }

  return [locale, saveLocale];
}
