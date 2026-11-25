import { Button, Row, Text } from '@umami/react-zen';
import { useState } from 'react';
import { SearchSelect } from '@/components/common/SearchSelect';
import { useLocale, useMessages } from '@/components/hooks';
import { DEFAULT_LOCALE } from '@/lib/constants';
import { languages } from '@/lib/lang';

export function LanguageSetting() {
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { locale, saveLocale } = useLocale();
  const items = search
    ? Object.keys(languages).filter(n => {
        return (
          n.toLowerCase().includes(search.toLowerCase()) ||
          languages[n].label.toLowerCase().includes(search.toLowerCase())
        );
      })
    : Object.keys(languages);

  const handleReset = () => saveLocale(DEFAULT_LOCALE);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setSearch('');
    }
  };

  return (
    <Row gap>
      <SearchSelect
        value={locale}
        items={items.map(item => ({ id: item, name: languages[item].label }))}
        onChange={val => saveLocale(val)}
        onSearch={setSearch}
        onOpenChange={handleOpen}
        maxHeight={480}
        renderValue={<Text truncate>{languages[locale]?.label ?? locale}</Text>}
        triggerProps={{ className: 'justify-between', style: { minWidth: '250px' } }}
      />
      <Button variant="outline" onClick={handleReset}>
        {t(labels.reset)}
      </Button>
    </Row>
  );
}
