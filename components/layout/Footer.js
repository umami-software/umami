import { Row, Column } from 'react-basics';
import { useRouter } from 'next/router';
import Script from 'next/script';
import classNames from 'classnames';
import { useIntl, defineMessages } from 'react-intl';
import { CURRENT_VERSION, HOMEPAGE_URL, REPO_URL } from 'lib/constants';
import styles from './Footer.module.css';

const messages = defineMessages({
  poweredBy: { id: 'message.powered-by', defaultMessage: 'Powered by {name}' },
});

export default function Footer({ className }) {
  const { pathname } = useRouter();
  const { formatMessage } = useIntl();

  return (
    <footer className={classNames(styles.footer, className)}>
      <Row>
        <Column>
          <div>
            {formatMessage(messages.poweredBy, {
              name: (
                <a href={HOMEPAGE_URL}>
                  <b>umami</b>
                </a>
              ),
            })}
          </div>
        </Column>
        <Column className={styles.version}>
          <a href={REPO_URL}>{`v${CURRENT_VERSION}`}</a>
        </Column>
      </Row>
      {!pathname.includes('/share/') && <Script src={`/telemetry.js`} />}
    </footer>
  );
}
