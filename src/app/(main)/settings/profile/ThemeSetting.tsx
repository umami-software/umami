import { Row, Button, Icon, useTheme } from '@umami/react-zen';
import { Icons } from '@/components/icons';

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  return (
    <Row gap>
      <Button
        variant={theme === 'light' ? 'primary' : 'secondary'}
        onPress={() => setTheme('light')}
      >
        <Icon fillColor="currentColor">
          <Icons.Sun />
        </Icon>
      </Button>
      <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onPress={() => setTheme('dark')}>
        <Icon fillColor="currentColor">
          <Icons.Moon />
        </Icon>
      </Button>
    </Row>
  );
}
