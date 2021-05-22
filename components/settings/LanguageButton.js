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
    case 'zh-CN':
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-sc/chinese-simplified-400.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-sc/chinese-simplified-500.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-sc/chinese-simplified-700.css');
      break;
    case 'zh-TW':
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-tc/chinese-traditional-400.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-tc/chinese-traditional-500.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-tc/chinese-traditional-700.css');
      break;
    case 'ja-JP':
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-jp/japanese-400.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-jp/japanese-500.css');
      import(/* webpackMode: "eager" */ '@fontsource/noto-sans-jp/japanese-700.css');
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
