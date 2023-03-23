import { Row, Column, Flexbox } from 'react-basics';
import AppLayout from 'components/layout/AppLayout';
import useMessages from 'hooks/useMessages';

export default function Custom404() {
  const { formatMessage, labels } = useMessages();

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
