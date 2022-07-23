import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import styles from './Footer.module.css';
import useStore from 'store/version';
import { HOMEPAGE_URL, REPO_URL } from 'lib/constants';

export default function Footer() {
  const { current } = useStore();

  return (
    <footer className={classNames(styles.footer, 'row')}>
      <div className="col-12 col-md-4" />
      <div className="col-12 col-md-4">
        <FormattedMessage
          id="message.powered-by"
          defaultMessage="Powered by {name}"
          values={{
            name: (
              <Link href={HOMEPAGE_URL}>
                <b>umami</b>
              </Link>
            ),
          }}
        />
      </div>
      <div className={classNames(styles.version, 'col-12 col-md-4')}>
        <Link href={REPO_URL}>{`v${current}`}</Link>
      </div>
      {!process.env.telemetryDisabled && (
        <img src={`https://i.umami.is/a.png?v=${current}`} alt="" />
      )}
    </footer>
  );
}
