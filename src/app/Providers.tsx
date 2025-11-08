'use client';
import { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ZenProvider, RouterProvider } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useLocale } from '@/components/hooks';
import 'chartjs-adapter-date-fns';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

function MessagesProvider({ children }) {
  const { locale, messages, dir } = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale, dir]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]} onError={() => null}>
      {children}
    </IntlProvider>
  );
}

export function Providers({ children }) {
  const router = useRouter();

  function navigate(url: string) {
    if (shouldUseNativeLink(url)) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }

  function shouldUseNativeLink(url: string) {
    return url.startsWith('http');
  }

  return (
    <ZenProvider>
      <RouterProvider navigate={navigate}>
        <MessagesProvider>
          <QueryClientProvider client={client}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </QueryClientProvider>
        </MessagesProvider>
      </RouterProvider>
    </ZenProvider>
  );
}
