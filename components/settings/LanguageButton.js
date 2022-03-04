import React from 'react';
import { languages } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import MenuButton from 'components/common/MenuButton';
import Globe from 'assets/globe.svg';
import styles from './LanguageButton.module.css';

export default function LanguageButton() {
  const { locale, saveLocale } = useLocale();
  const menuOptions = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value) {
    saveLocale(value);
  }

  return (
    <MenuButton
      icon={<Globe />}
      options={menuOptions}
      value={locale}
      menuClassName={styles.menu}
      buttonVariant="light"
      onSelect={handleSelect}
      hideLabel
    />
  );
}
