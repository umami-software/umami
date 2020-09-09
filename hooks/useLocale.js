import { useDispatch, useSelector } from 'react-redux';
import { updateApp } from 'redux/actions/app';

export default function useLocale() {
  const locale = useSelector(state => state.app.locale);
  const dispatch = useDispatch();

  function setLocale(value) {
    dispatch(updateApp({ locale: value }));
  }

  return [locale, setLocale];
}
