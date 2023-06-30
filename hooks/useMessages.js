import { useIntl, FormattedMessage } from 'react-intl';
import { messages, labels } from 'components/messages';

export function useMessages() {
  const { formatMessage } = useIntl();

  function getMessage(id) {
    const message = Object.values(messages).find(value => value.id === id);

    return message ? formatMessage(message) : id;
  }

  return { formatMessage, FormattedMessage, messages, labels, getMessage };
}

export default useMessages;
