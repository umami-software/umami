'use client';
import { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactBasicsProvider } from 'react-basics';
import ErrorBoundary from 'components/common/ErrorBoundary';
import SettingsContext from 'app/(main)/settings/SettingsContext';
import useLocale from 'components/hooks/useLocale';
import 'chartjs-adapter-date-fns';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function MessagesProvider({ children }) {
  const { locale, messages } = useLocale();
  return (
    <IntlProvider locale={locale} messages={messages[locale]} onError={() => null}>
      {children}
    </IntlProvider>
  );
}

function SettingsProvider({ children }) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    const hostUrl = process.env.hostUrl || window?.location.origin;

    setConfig({
      shareUrl: hostUrl,
      trackingCodeUrl: hostUrl,
      websitesUrl: '/websites',
      settingsPath: '/settings/websites',
      websitesPath: `/websites`,
    });
  }, []);

  return <SettingsContext.Provider value={config}>{children}</SettingsContext.Provider>;
}

export function Providers({ children }) {
  return (
    <MessagesProvider>
      <SettingsProvider>
        <QueryClientProvider client={client}>
          <ReactBasicsProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ReactBasicsProvider>
        </QueryClientProvider>
      </SettingsProvider>
    </MessagesProvider>
  );
}

export default Providers;
