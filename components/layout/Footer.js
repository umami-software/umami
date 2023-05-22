import { Row, Column } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import { CURRENT_VERSION, HOMEPAGE_URL, REPO_URL } from 'lib/constants';
import { labels } from 'components/messages';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Row>
        <Column defaultSize={12} lg={11} xl={11}>
          <div>
            <FormattedMessage
              {...labels.poweredBy}
              values={{
                name: (
                  <a href={HOMEPAGE_URL}>
                    <b>umami</b>
                  </a>
                ),
              }}
            />
          </div>
        </Column>
        <Column className={styles.version} defaultSize={12} lg={1} xl={1}>
          <a href={REPO_URL}>{`v${CURRENT_VERSION}`}</a>
        </Column>
      </Row>
    </footer>
  );
}

export default Footer;
