import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useStore } from 'redux/store';
import { updateApp } from 'redux/actions/app';
import { messages } from 'lib/lang';
import 'styles/variables.css';
import 'styles/bootstrap-grid.css';
import 'styles/index.css';

const Intl = ({ children }) => {
  const dispatch = useDispatch();
  const locale = useSelector(state => state.app.locale);

  const Wrapper = ({ children }) => <span className={locale}>{children}</span>;

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved) {
      dispatch(updateApp({ locale: saved }));
    }
  });

  return (
    <IntlProvider locale={locale} messages={messages[locale]} textComponent={Wrapper}>
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
