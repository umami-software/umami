import { useIntl } from 'react-intl';
import { messages, labels } from '@/components/messages';

export function useMessages(): any {
  const intl = useIntl();

  const getMessage = (id: string) => {
    const message = Object.values(messages).find(value => value.id === id);

    return message ? formatMessage(message) : id;
  };

  const formatMessage = (
    descriptor: {
      id: string;
      defaultMessage: string;
    },
    values?: { [key: string]: string },
    opts?: any,
  ) => {
    return descriptor ? intl.formatMessage(descriptor, values, opts) : null;
  };

  return { formatMessage, messages, labels, getMessage };
}

export default useMessages;
