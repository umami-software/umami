import { Button, Icon, Row, useTheme } from '@umami/react-zen';
import { Moon, Sun } from '@/components/icons';

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <Row gap>
      <Button variant={theme === 'light' ? 'primary' : undefined} onPress={() => setTheme('light')}>
        <Icon>
          <Sun />
        </Icon>
      </Button>
      <Button variant={theme === 'dark' ? 'primary' : undefined} onPress={() => setTheme('dark')}>
        <Icon>
          <Moon />
        </Icon>
      </Button>
    </Row>
  );
}
