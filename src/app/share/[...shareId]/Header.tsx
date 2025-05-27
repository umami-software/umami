import { Row, Icon, Text, ThemeButton } from '@umami/react-zen';
import Link from 'next/link';
import { LanguageButton } from '@/components/input/LanguageButton';
import { SettingsButton } from '@/components/input/SettingsButton';
import { Logo } from '@/components/icons';

export function Header() {
  return (
    <Row as="header">
      <Row gap>
        <Link href="https://umami.is" target="_blank">
          <Icon size="lg">
            <Logo />
          </Icon>
          <Text>umami</Text>
        </Link>
      </Row>
      <Row alignItems="center" gap>
        <ThemeButton />
        <LanguageButton />
        <SettingsButton />
      </Row>
    </Row>
  );
}
