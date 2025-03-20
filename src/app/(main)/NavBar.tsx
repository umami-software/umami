import { ThemeButton, Row } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';

export function NavBar() {
  return (
    <Row justifyContent="space-between" alignItems="center" paddingY="3">
      <TeamsButton />
      <Row justifyContent="flex-end">
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
