import { Row, Column, Flexbox } from 'react-basics';
import { useIntl } from 'react-intl';
import AppLayout from 'components/layout/AppLayout';
import { labels } from 'components/messages';

export default function Custom404() {
  const { formatMessage } = useIntl();

  return (
    <AppLayout>
      <Row>
        <Column>
          <Flexbox alignItems="center" justifyContent="center" flex={1} style={{ minHeight: 600 }}>
            <h1>{formatMessage(labels.pageNotFound)}</h1>
          </Flexbox>
        </Column>
      </Row>
    </AppLayout>
  );
}
