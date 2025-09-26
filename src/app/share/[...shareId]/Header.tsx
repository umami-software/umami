import { Row, Icon, Text, ThemeButton } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { Logo } from '@/components/svg';

export function Header() {
  return (
    <Row as="header" justifyContent="space-between" alignItems="center" paddingY="3">
      <a href="https://umami.is" target="_blank">
        <Row alignItems="center" gap>
          <Icon>
            <Logo />
          </Icon>
          <Text weight="bold">umami</Text>
        </Row>
      </a>
      <Row alignItems="center" gap>
        <ThemeButton />
        <LanguageButton />
        <PreferencesButton />
      </Row>
    </Row>
  );
}
