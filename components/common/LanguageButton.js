import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Globe from 'assets/globe.svg';
import useDocumentClick from 'hooks/useDocumentClick';
import Menu from './Menu';
import Button from './Button';
import { menuOptions } from 'lib/lang';
import styles from './LanguageButton.module.css';
import useLocale from '../../hooks/useLocale';

export default function LanguageButton({ menuPosition = 'bottom', menuAlign = 'left' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [locale, setLocale] = useLocale();
  const ref = useRef();
  const selectedLocale = menuOptions.find(e => e.value === locale)?.display;

  function handleSelect(value) {
    setLocale(value);
    window.localStorage.setItem('locale', value);
    setShowMenu(false);
  }

  function toggleMenu() {
    setShowMenu(state => !state);
  }

  useDocumentClick(e => {
    if (!ref.current.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <>
      <Head>
        {locale === 'zh-CN' && (
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
      <div ref={ref} className={styles.container}>
        <Button icon={<Globe />} onClick={toggleMenu} size="small">
          <div>{selectedLocale}</div>
        </Button>
        {showMenu && (
          <Menu
            className={styles.menu}
            options={menuOptions}
            onSelect={handleSelect}
            float={menuPosition}
            align={menuAlign}
          />
        )}
      </div>
    </>
  );
}
