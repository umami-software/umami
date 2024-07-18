import { useState } from 'react';
import { Button, Dropdown, Item, Flexbox } from 'react-basics';
import { useLocale, useMessages } from 'components/hooks';
import { DEFAULT_LOCALE } from 'lib/constants';
import { languages } from 'lib/lang';
import styles from './LanguageSetting.module.css';

export function LanguageSetting() {
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const { locale, saveLocale } = useLocale();
  const options = search
    ? Object.keys(languages).filter(n => {
        return (
          n.toLowerCase().includes(search.toLowerCase()) ||
          languages[n].label.toLowerCase().includes(search.toLowerCase())
        );
      })
    : Object.keys(languages);

  const handleReset = () => saveLocale(DEFAULT_LOCALE);

  const renderValue = (value: string | number) => languages?.[value]?.label;

  return (
    <Flexbox gap={10}>
      <Dropdown
        items={options}
        value={locale}
        renderValue={renderValue}
        onChange={val => saveLocale(val as string)}
        allowSearch={true}
        onSearch={setSearch}
        menuProps={{ className: styles.menu }}
      >
        {item => <Item key={item}>{languages[item].label}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default LanguageSetting;
