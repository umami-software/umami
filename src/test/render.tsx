import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type RenderOptions,
  screen,
  render as testingLibraryRender,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, ZenProvider } from '@umami/react-zen';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';
import { FlagsContext } from '@/components/hooks/useFlag';
import { type FlagValues, getDefaultFlagValues } from '@/lib/flags';
import enUS from '../../public/intl/messages/en-US.json';
import { setTestUrl } from './navigation';

type TestRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Feature flag values, merged over the declared defaults. */
  flags?: Partial<FlagValues>;
  locale?: string;
  messages?: Record<string, unknown>;
  queryClient?: QueryClient;
  route?: string;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60,
      },
    },
  });
}

function TestProviders({
  children,
  flags,
  locale = 'en-US',
  messages = enUS,
  queryClient = createTestQueryClient(),
}: {
  children: ReactNode;
  flags?: Partial<FlagValues>;
  locale?: string;
  messages?: Record<string, unknown>;
  queryClient?: QueryClient;
}) {
  return (
    <FlagsContext.Provider value={{ ...getDefaultFlagValues(), ...flags }}>
      <ZenProvider>
        <RouterProvider>
          <NextIntlClientProvider locale={locale} messages={messages} onError={() => null}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </NextIntlClientProvider>
        </RouterProvider>
      </ZenProvider>
    </FlagsContext.Provider>
  );
}

export function render(
  ui: ReactElement,
  {
    flags,
    locale = 'en-US',
    messages = enUS,
    queryClient = createTestQueryClient(),
    route = '/',
    ...options
  }: TestRenderOptions = {},
) {
  setTestUrl(route);

  return {
    queryClient,
    user: userEvent.setup(),
    ...testingLibraryRender(ui, {
      wrapper: ({ children }) => (
        <TestProviders flags={flags} locale={locale} messages={messages} queryClient={queryClient}>
          {children}
        </TestProviders>
      ),
      ...options,
    }),
  };
}

export { screen, userEvent, waitFor, within };
