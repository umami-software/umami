import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'components/common/Link';
import styles from './Footer.module.css';
import useVersion from 'hooks/useVersion';

export default function Footer() {
  const { current } = useVersion();
  return (
    <footer className="container">
      <div className={styles.footer}>
        <div />
        <div>
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
        <div>{`v${current}`}</div>
      </div>
    </footer>
  );
}
