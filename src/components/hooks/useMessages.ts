import { useTranslations } from 'next-intl';
import { createElement, type ReactNode } from 'react';
import { labels, type MessageDescriptor, messages } from '@/components/messages';
import type { ApiError } from '@/lib/types';

type FormatMessage = (
  descriptor: MessageDescriptor,
  values?: Record<string, string | number | boolean | null | undefined>,
  opts?: any,
) => string | null;

interface FormattedMessageProps extends MessageDescriptor {
  values?: Record<string, ReactNode>;
}

interface UseMessages {
  formatMessage: FormatMessage;
  messages: typeof messages;
  labels: typeof labels;
  getMessage: (id: string) => string;
  getErrorMessage: (error: ApiError) => string | undefined;
  FormattedMessage: (props: FormattedMessageProps) => ReactNode;
}

export function useMessages(): UseMessages {
  const t = useTranslations();

  const formatMessage = (
    descriptor: MessageDescriptor,
    values?: Record<string, string | number | boolean | null | undefined>,
  ) => {
    if (!descriptor) return null;
    try {
      return t(descriptor.id, values);
    } catch {
      return descriptor.defaultMessage || descriptor.id;
    }
  };

  const getMessage = (id: string) => {
    const message = Object.values(messages).find(value => value.id === `message.${id}`);

    return message ? formatMessage(message) : id;
  };

  const getErrorMessage = (error: ApiError) => {
    if (!error) {
      return undefined;
    }

    const code = error?.code;

    return code ? getMessage(code) : error?.message || 'Unknown error';
  };

  function FormattedMessage({ id, defaultMessage, values }: FormattedMessageProps) {
    if (
      !values ||
      Object.values(values).every(v => typeof v === 'string' || typeof v === 'number')
    ) {
      try {
        return t(id, values as any);
      } catch {
        return defaultMessage || id;
      }
    }

    // For JSX values: get the raw ICU template and manually interpolate
    let template: string;
    try {
      template = t.raw(id) as string;
    } catch {
      template = defaultMessage || id;
    }

    if (typeof template !== 'string') {
      return defaultMessage || id;
    }

    // Split on {placeholder} tokens and interleave with values
    const parts: ReactNode[] = [];
    const regex = /\{(\w+)\}/g;
    let lastIndex = 0;

    for (let match = regex.exec(template); match !== null; match = regex.exec(template)) {
      if (match.index > lastIndex) {
        parts.push(template.slice(lastIndex, match.index));
      }
      const key = match[1];
      parts.push(values[key] !== undefined ? values[key] : match[0]);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < template.length) {
      parts.push(template.slice(lastIndex));
    }

    return createElement('span', null, ...parts);
  }

  return { formatMessage, messages, labels, getMessage, getErrorMessage, FormattedMessage };
}
