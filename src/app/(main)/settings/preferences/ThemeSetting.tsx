import { Row, Button, Icon, useTheme } from '@umami/react-zen';
import { useMessages, usePreferences } from '@/components/hooks';
import { Sun, Moon } from '@/components/icons';

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  const { formatMessage, labels } = useMessages();
  const { updatePreferences } = usePreferences();

  const handleChange = (value: 'light' | 'dark') => {
    setTheme(value);
    updatePreferences({ theme: value });
  };

  const handleReset = () => {
    setTheme('light');
    updatePreferences({ theme: null });
  };

  return (
    <Row gap>
      <Button
        variant={theme === 'light' ? 'primary' : undefined}
        onPress={() => handleChange('light')}
      >
        <Icon>
          <Sun />
        </Icon>
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : undefined}
        onPress={() => handleChange('dark')}
      >
        <Icon>
          <Moon />
        </Icon>
      </Button>
      <Button onPress={handleReset}>{formatMessage(labels.reset)}</Button>
    </Row>
  );
}
