import React from 'react';
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

  switch (locale) {
    case 'zn-CN':
      import('@fontsource/noto-sans-sc/400.css');
      import('@fontsource/noto-sans-sc/500.css');
      import('@fontsource/noto-sans-sc/700.css');
      break;
    case 'zh-TW':
      import('@fontsource/noto-sans-tc/400.css');
      import('@fontsource/noto-sans-tc/500.css');
      import('@fontsource/noto-sans-tc/700.css');
      break;
    case 'ja-JP':
      import('@fontsource/noto-sans-jp/400.css');
      import('@fontsource/noto-sans-jp/500.css');
      import('@fontsource/noto-sans-jp/700.css');
      break;
  }

  return (
    <MenuButton
      icon={<Globe />}
      options={menuOptions}
      value={locale}
      menuClassName={styles.menu}
      renderValue={option => option?.display}
      onSelect={handleSelect}
    />
  );
}
