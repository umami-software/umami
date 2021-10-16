import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import styles from './Footer.module.css';
import useVersion from 'hooks/useVersion';
import useLocale from 'hooks/useLocale';
import { rtlLocales } from 'lib/lang';

export default function Footer() {
  const { current } = useVersion();
  const { locale } = useLocale();

  return (
    <footer className="container" dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'}>
      <div className={classNames(styles.footer, 'row')}>
        <div className="col-12 col-md-4" />
        <div className="col-12 col-md-4">
          <FormattedMessage
            id="message.powered-by"
            defaultMessage="Powered by {name}"
            values={{
              name: (
                <Link href="https://umami.is">
                  <b>umami</b>
                </Link>
              ),
            }}
          />
        </div>
        <div className={classNames(styles.version, 'col-12 col-md-4')}>
          <Link href={`https://github.com/mikecao/umami/releases`}>{`v${current}`}</Link>
        </div>
      </div>
    </footer>
  );
}
