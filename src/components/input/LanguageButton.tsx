import { Button, Dialog, DialogTrigger, Grid, Icon, Popover, Text } from '@umami/react-zen';
import { Globe } from 'lucide-react';
import { useLocale } from '@/components/hooks';
import { languages } from '@/lib/lang';

export function LanguageButton() {
  const { locale, saveLocale } = useLocale();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value: string, close: () => void) {
    saveLocale(value);
    close();
  }

  return (
    <DialogTrigger key="language">
      <Button variant="quiet">
        <Icon color="primary">
          <Globe />
        </Icon>
      </Button>
      <Popover side="bottom" align="end">
        <Dialog>
          {({ close }) => (
            <Grid columns="repeat(3, minmax(200px, 1fr))" overflow="hidden">
              {items.map(({ value, label }) => {
                return (
                  <Button key={value} variant="quiet" onPress={() => handleSelect(value, close)}>
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
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
