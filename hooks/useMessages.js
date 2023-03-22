import { useIntl } from 'react-intl';
import { messages, labels } from 'components/messages';

export default function useMessages() {
  const { formatMessage } = useIntl();

  return { formatMessage, messages, labels };
}
