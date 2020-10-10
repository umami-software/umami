import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import styles from './Footer.module.css';
import useVersion from 'hooks/useVersion';

export default function Footer() {
  const { current } = useVersion();
  return (
    <footer className="container">
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
