import { Row, Button, Icon, useTheme } from '@umami/react-zen';
import { Lucide } from '@/components/icons';

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <Row gap>
      <Button
        variant={theme === 'light' ? 'primary' : 'secondary'}
        onPress={() => setTheme('light')}
      >
        <Icon>
          <Lucide.Sun />
        </Icon>
      </Button>
      <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onPress={() => setTheme('dark')}>
        <Icon>
          <Lucide.Moon />
        </Icon>
      </Button>
    </Row>
  );
}
