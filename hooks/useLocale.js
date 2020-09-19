import { useDispatch, useSelector } from 'react-redux';
import { updateApp } from 'redux/actions/app';
import { setItem } from 'lib/web';
import { LOCALE_CONFIG } from 'lib/constants';

export default function useLocale() {
  const locale = useSelector(state => state.app.locale);
  const dispatch = useDispatch();

  function setLocale(value) {
    setItem(LOCALE_CONFIG, value);
    dispatch(updateApp({ locale: value }));
  }

  return [locale, setLocale];
}
