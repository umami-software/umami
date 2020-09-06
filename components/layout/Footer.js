import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import classNames from 'classnames';
import Button from 'components/common/Button';
import Logo from 'assets/logo.svg';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className="container">
      <div className={classNames(styles.footer, 'row justify-content-center')}>
        <div>
          <FormattedMessage id="footer.powered-by" defaultMessage="powered by" />
        </div>
        <Link href="https://umami.is">
          <a>
            <Button icon={<Logo />} size="small">
              <b>umami</b>
            </Button>
          </a>
        </Link>
      </div>
    </footer>
  );
}
