import React from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './Footer.module.css';

export default function Footer() {
  const version = process.env.VERSION;
  return (
    <footer className="container">
      <div className={styles.footer}>
        <div />
        <div>
          <FormattedMessage
            id="footer.powered-by"
            defaultMessage="Powered by {name} {version}"
            values={{
              name: (
                <a href="https://umami.is">
                  <b>umami</b>
                </a>
              ),
            }}
          />
        </div>
        <div>{`v${version}`}</div>
      </div>
    </footer>
  );
}
