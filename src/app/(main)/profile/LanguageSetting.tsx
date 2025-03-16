import { useState } from 'react';
import { Button, Select, ListItem, Flexbox } from '@umami/react-zen';
import { useLocale, useMessages } from '@/components/hooks';
import { DEFAULT_LOCALE } from '@/lib/constants';
import { languages } from '@/lib/lang';
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

  console.log({ options });

  return (
    <Flexbox gap={10}>
      <Select value={locale} onChange={val => saveLocale(val as string)}>
        {options.map(item => (
          <ListItem key={item} id={item}>
            {languages[item].label}
          </ListItem>
        ))}
      </Select>
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}
