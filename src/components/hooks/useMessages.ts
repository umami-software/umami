import { FormattedMessage, type MessageDescriptor, useIntl } from 'react-intl';
import { labels, messages } from '@/components/messages';
import type { ApiError } from '@/lib/types';

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
  getErrorMessage: (error: string | Error | ApiError) => string | undefined;
  FormattedMessage: typeof FormattedMessage;
}

export function useMessages(): UseMessages {
  const intl = useIntl();

  const getMessage = (id: string) => {
    const message = Object.values(messages).find(value => value.id === `message.${id}`);

    return message ? formatMessage(message) : id;
  };

  const getErrorMessage = (error: string | Error | ApiError) => {
    if (!error) {
      return undefined;
    }

    if (typeof error === 'string') {
      return error;
    }

    const code = (error as ApiError)?.code;

    return code ? getMessage(code) : error?.message || 'Unknown error';
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
