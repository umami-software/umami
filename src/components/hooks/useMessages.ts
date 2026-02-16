import { useTranslations } from 'next-intl';
import { labels, messages } from '@/components/messages';
import type { ApiError } from '@/lib/types';

export function useMessages() {
  const t = useTranslations();

  const getMessage = (id: string) => t(`message.${id}`);

  const getErrorMessage = (error: string | Error | undefined) => {
    if (!error) {
      return undefined;
    }

    if (typeof error === 'string') {
      return error;
    }

    const code = (error as ApiError)?.code;

    return code ? getMessage(code) : error?.message || 'Unknown error';
  };

  return { t, messages, labels, getMessage, getErrorMessage };
}
