import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useStore } from 'redux/store';
import 'styles/variables.css';
import 'styles/bootstrap-grid.css';
import 'styles/index.css';
import en from 'lang-compiled/en.json';
import cn from 'lang-compiled/zh-CN.json';
import { updateApp } from '../redux/actions/app';

const messages = {
  en,
  'zh-CN': cn,
};

const Intl = ({ children }) => {
  const dispatch = useDispatch();
  const locale = useSelector(state => state.app.locale);

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved) {
      dispatch(updateApp({ locale: saved }));
    }
  });

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
};

export default function App({ Component, pageProps }) {
  const store = useStore();

  return (
    <Provider store={store}>
      <Intl>
        <Component {...pageProps} />
      </Intl>
    </Provider>
  );
}
