import Head from 'next/head';
import useLocale from 'hooks/useLocale';
import styles from './LoginLayout.module.css';

export function LoginLayout({ children }) {
  const { dir } = useLocale();

  return (
    <div className={styles.layout} dir={dir}>
      <Head>
        <title>{`Login | umami`}</title>
      </Head>
      {children}
    </div>
  );
}

export default LoginLayout;
