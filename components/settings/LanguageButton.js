import React from 'react';
import Head from 'next/head';
import { menuOptions } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import MenuButton from 'components/common/MenuButton';
import Globe from 'assets/globe.svg';
import styles from './LanguageButton.module.css';

export default function LanguageButton() {
  const [locale, setLocale] = useLocale();

  function handleSelect(value) {
    setLocale(value);
  }

  return (
    <>
      <Head>
        {(locale === 'zh-CN' || locale === 'zh-TW') && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'ja-JP' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        )}
      </Head>
      <MenuButton
        icon={<Globe />}
        options={menuOptions}
        value={locale}
        menuClassName={styles.menu}
        renderValue={option => option?.display}
        onSelect={handleSelect}
      />
    </>
  );
}
