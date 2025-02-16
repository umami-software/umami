'use client';
import { ThemeButton, Row } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';

export function NavBar() {
  return (
    <Row justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3">
      <div></div>
      <Row justifyContent="flex-end">
        <TeamsButton />
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
