import { Row, Column } from 'react-basics';
import { FormattedMessage } from 'react-intl';
import { CURRENT_VERSION, HOMEPAGE_URL, REPO_URL } from 'lib/constants';
import { labels } from 'components/messages';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Row>
        <Column defaultSize={11} xs={12} sm={12}>
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
        <Column className={styles.version} defaultSize={1} xs={12} sm={12}>
          <a href={REPO_URL}>{`v${CURRENT_VERSION}`}</a>
        </Column>
      </Row>
    </footer>
  );
}
