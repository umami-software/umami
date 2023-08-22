import { useIntl, FormattedMessage } from 'react-intl';
import { messages, labels } from 'components/messages';

export function useMessages() {
  const intl = useIntl();

  const getMessage = id => {
    const message = Object.values(messages).find(value => value.id === id);

    return message ? formatMessage(message) : id;
  };

  const formatMessage = (descriptor, values, opts) => {
    return descriptor ? intl.formatMessage(descriptor, values, opts) : null;
  };

  return { formatMessage, FormattedMessage, messages, labels, getMessage };
}

export default useMessages;
