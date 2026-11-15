import { Menu, MenuItem, Text } from '@umami/react-zen';
import { useLocale } from '@/components/hooks';
import { languages } from '@/lib/lang';

const languageItems = Object.keys(languages).map(key => ({
  value: key,
  label: languages[key].label,
}));

export interface LanguageMenuProps {
  onSelect?: (value: string) => void;
}

export function LanguageMenu({ onSelect }: LanguageMenuProps) {
  const { locale, saveLocale } = useLocale();

  const handleSelect = (value: string) => {
    saveLocale(value);
    onSelect?.(value);
  };

  return (
    <Menu
      selectionMode="single"
      selectedKeys={new Set([locale])}
      style={{ maxHeight: 300, overflow: 'auto' }}
    >
      {languageItems.map(({ value, label }) => (
        <MenuItem key={value} id={value} onAction={() => handleSelect(value)}>
          <Text weight={value === locale ? 'bold' : undefined}>{label}</Text>
        </MenuItem>
      ))}
    </Menu>
  );
}
