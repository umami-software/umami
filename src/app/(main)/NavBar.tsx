import { ThemeButton, Row } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import type { RowProps } from '@umami/react-zen/Row';

export function NavBar(props: RowProps) {
  return (
    <Row
      {...props}
      justifyContent="space-between"
      alignItems="center"
      paddingY="3"
      paddingX="3"
      paddingRight="5"
    >
      <TeamsButton />
      <Row justifyContent="flex-end">
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
