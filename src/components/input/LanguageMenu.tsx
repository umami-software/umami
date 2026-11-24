import { DropdownMenuRadioGroup, DropdownMenuRadioItem, ScrollArea, Text } from '@umami/react-zen';
import { useLocale } from '@/components/hooks';
import { languages } from '@/lib/lang';

const languageItems = Object.keys(languages).map(key => ({
  value: key,
  label: languages[key].label,
}));

export interface LanguageMenuProps {
  onSelect?: (value: string) => void;
}

/** Language options. Render inside a `DropdownMenuContent` or `DropdownMenuSubContent`. */
export function LanguageMenu({ onSelect }: LanguageMenuProps) {
  const { locale, saveLocale } = useLocale();

  const handleSelect = (value: string) => {
    saveLocale(value);
    onSelect?.(value);
  };

  return (
    <ScrollArea style={{ height: 'min(300px, calc(var(--available-height, 300px) - 8px))' }}>
      <DropdownMenuRadioGroup value={locale}>
        {languageItems.map(({ value, label }) => (
          <DropdownMenuRadioItem
            key={value}
            value={value}
            closeOnClick
            onClick={() => handleSelect(value)}
          >
            <Text weight={value === locale ? 'bold' : undefined}>{label}</Text>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </ScrollArea>
  );
}
