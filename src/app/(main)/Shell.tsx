'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import UpdateNotice from 'components/common/UpdateNotice';
import { useRequireLogin, useConfig } from 'components/hooks';

export function Shell({ children }) {
  const { user } = useRequireLogin();
  const config = useConfig();
  const pathname = usePathname();

  if (!user || !config) {
    return null;
  }

  return (
    <>
      {children}
      <UpdateNotice user={user} config={config} />
      {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
        <Script src={`telemetry.js`} />
      )}
    </>
  );
}

export default Shell;
