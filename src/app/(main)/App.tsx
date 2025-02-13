'use client';
import { Grid, Loading } from '@umami/react-zen';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import UpdateNotice from './UpdateNotice';
import NavBar from '@/app/(main)/NavBar';
import Page from '@/components/layout/Page';
import { useLogin, useConfig } from '@/components/hooks';

export function App({ children }) {
  const { user, isLoading, error } = useLogin();
  const config = useConfig();
  const pathname = usePathname();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    window.location.href = `${process.env.basePath || ''}/login`;
  }

  if (!user || !config) {
    return null;
  }

  if (config.uiDisabled) {
    return null;
  }

  return (
    <Grid rows="auto 1fr">
      <NavBar />
      <Page>
        <UpdateNotice user={user} config={config} />
        {children}
        {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
          <Script src={`${process.env.basePath || ''}/telemetry.js`} />
        )}
      </Page>
    </Grid>
  );
}

export default App;
