import React from 'react';
import { FormattedMessage } from 'react-intl';
import DropDown from 'components/common/DropDown';
import Button from 'components/common/Button';
import useLocale from 'hooks/useLocale';
import { DEFAULT_LOCALE } from 'lib/constants';
import styles from './TimezoneSetting.module.css';
import { languages } from '../../lib/lang';

export default function LanguageSetting() {
  const { locale, saveLocale } = useLocale();
  const options = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleReset() {
    saveLocale(DEFAULT_LOCALE);
  }

  return (
    <>
      <DropDown
        menuClassName={styles.menu}
        value={locale}
        options={options}
        onChange={saveLocale}
      />
      <Button className={styles.button} size="small" onClick={handleReset}>
        <FormattedMessage id="label.reset" defaultMessage="Reset" />
      </Button>
    </>
  );
}
