import { useIntl, FormattedMessage } from 'react-intl';
import { messages, labels } from 'components/messages';

export default function useMessages() {
  const { formatMessage } = useIntl();

  function getMessage(id) {
    const message = Object.values(messages).find(value => value.id === id);

    return message ? formatMessage(message) : id;
  }

  return { formatMessage, FormattedMessage, messages, labels, getMessage };
}
