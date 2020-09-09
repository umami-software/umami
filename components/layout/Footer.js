import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Button from 'components/common/Button';
import Logo from 'assets/logo.svg';
import styles from './Footer.module.css';

export default function Footer() {
  const version = process.env.VERSION;
  return (
    <footer className="container">
      <div className={classNames(styles.footer, 'row justify-content-center')}>
        <FormattedMessage id="footer.powered-by" defaultMessage="Powered by" />
        <a href="https://umami.is">
          <Button className={styles.button} icon={<Logo />} size="small">
            <b>umami</b>
          </Button>
        </a>
        <div>{`v${version}`}</div>
      </div>
    </footer>
  );
}
