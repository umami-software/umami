import { Icon, Button, MenuTrigger, Popover, Grid, Text, Dialog } from '@umami/react-zen';
import { languages } from '@/lib/lang';
import { useLocale } from '@/components/hooks';
import { Globe } from 'lucide-react';

export function LanguageButton() {
  const { locale, saveLocale } = useLocale();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value: string) {
    saveLocale(value);
  }

  return (
    <MenuTrigger key="language">
      <Button variant="quiet">
        <Icon>
          <Globe />
        </Icon>
      </Button>
      <Popover placement="bottom end">
        <Dialog variant="menu">
          <Grid columns="repeat(3, minmax(200px, 1fr))" overflow="hidden">
            {items.map(({ value, label }) => {
              return (
                <Button key={value} variant="quiet" onPress={() => handleSelect(value)}>
                  <Text
                    weight={value === locale ? 'bold' : 'medium'}
                    color={value === locale ? undefined : 'muted'}
                  >
                    {label}
                  </Text>
                </Button>
              );
            })}
          </Grid>
        </Dialog>
      </Popover>
    </MenuTrigger>
  );
}
