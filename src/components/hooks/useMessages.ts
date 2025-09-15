import { useIntl } from 'react-intl';
import { messages, labels } from '@/components/messages';

export function useMessages() {
  const intl = useIntl();

  const getMessage = (id: string) => {
    const message = Object.values(messages).find(value => value.id === `message.${id}`);

    return message ? formatMessage(message) : id;
  };

  const getErrorMessage = (error: unknown) => {
    if (!error) {
      return undefined;
    }

    const code = error?.['code'];

    return code ? getMessage(code) : error?.['message'] || 'Unknown error';
  };

  const formatMessage = (
    descriptor: {
      id: string;
      defaultMessage: string;
    },
    values?: Record<string, string>,
    opts?: any,
  ) => {
    return descriptor ? intl.formatMessage(descriptor, values, opts) : null;
  };

  return { formatMessage, messages, labels, getMessage, getErrorMessage };
}
