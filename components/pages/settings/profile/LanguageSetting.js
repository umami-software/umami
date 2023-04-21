import { Button, Dropdown, Item, Flexbox } from 'react-basics';
import useLocale from 'hooks/useLocale';
import { DEFAULT_LOCALE } from 'lib/constants';
import { languages } from 'lib/lang';
import useMessages from 'hooks/useMessages';

export function LanguageSetting() {
  const { formatMessage, labels } = useMessages();
  const { locale, saveLocale } = useLocale();
  const options = Object.keys(languages);

  const handleReset = () => saveLocale(DEFAULT_LOCALE);

  const renderValue = value => languages[value].label;

  return (
    <Flexbox gap={10}>
      <Dropdown
        items={options}
        value={locale}
        renderValue={renderValue}
        onChange={saveLocale}
        menuProps={{ style: { height: 300, width: 300 } }}
      >
        {item => <Item key={item}>{languages[item].label}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(labels.reset)}</Button>
    </Flexbox>
  );
}

export default LanguageSetting;
