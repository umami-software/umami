import { useIntl, FormattedMessage, type MessageDescriptor } from 'react-intl';
import { messages, labels } from '@/components/messages';

type FormatMessage = (
  descriptor: MessageDescriptor,
  values?: Record<string, string | number | boolean | null | undefined>,
  opts?: any,
) => string | null;

interface UseMessages {
  formatMessage: FormatMessage;
  messages: typeof messages;
  labels: typeof labels;
  getMessage: (id: string) => string;
  getErrorMessage: (error: unknown) => string | undefined;
  FormattedMessage: typeof FormattedMessage;
}

export function useMessages(): UseMessages {
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
    descriptor: MessageDescriptor,
    values?: Record<string, string | number | boolean | null | undefined>,
    opts?: any,
  ) => {
    return descriptor ? intl.formatMessage(descriptor, values, opts) : null;
  };

  return { formatMessage, messages, labels, getMessage, getErrorMessage, FormattedMessage };
}
