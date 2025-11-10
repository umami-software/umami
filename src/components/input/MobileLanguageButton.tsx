import { Icon, Button, MenuTrigger, Popover, Grid, Text, Dialog, Row } from '@umami/react-zen';
import { languages } from '@/lib/lang';
import { useLocale } from '@/components/hooks';
import { Globe } from 'lucide-react';
import { ThemeButton } from '@umami/react-zen';

export function MobileLanguageButton() {
  const { locale, saveLocale } = useLocale();
  const items = Object.keys(languages).map(key => ({ ...languages[key], value: key }));

  function handleSelect(value: string) {
    saveLocale(value);
  }

  return (
    <Row
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        padding: 16,
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--border)',
        gap: 8,
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <MenuTrigger>
        <Button variant="quiet">
          <Icon>
            <Globe />
          </Icon>
        </Button>
        <Popover
          placement="top"
          style={{
            width: '75vw',
            maxWidth: '100vw',
            left: '0 !important',
            right: '0 !important',
            marginBottom: 16,
            position: 'fixed',
          }}
        >
          <Dialog variant="menu" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Grid columns="1fr" gap={1} style={{ padding: '8px 0' }}>
              {items.map(({ value, label }) => (
                <Button
                  key={value}
                  variant="quiet"
                  onPress={() => handleSelect(value)}
                  style={{
                    padding: '16px 24px',
                    justifyContent: 'flex-start',
                    minHeight: '48px',
                  }}
                >
                  <Text
                    weight={value === locale ? 'bold' : 'medium'}
                    color={value === locale ? undefined : 'muted'}
                  >
                    {label}
                  </Text>
                </Button>
              ))}
            </Grid>
          </Dialog>
        </Popover>
      </MenuTrigger>
      <ThemeButton />
    </Row>
  );
}
