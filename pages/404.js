import AppLayout from 'components/layout/AppLayout';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  notFound: { id: 'message.page-not-found', defaultMessage: 'Page not found' },
});

export default function Custom404() {
  const { formatMessage } = useIntl();

  return (
    <AppLayout>
      <div className="row justify-content-center">
        <h1 style={{ textAlign: 'center' }}>{formatMessage(messages.notFound)}</h1>
      </div>
    </AppLayout>
  );
}
