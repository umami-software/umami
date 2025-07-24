import { ThemeButton, Row } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';

export function TopNav() {
  return (
    <Row
      position="absolute"
      top="0"
      alignItems="center"
      justifyContent="flex-end"
      paddingY="2"
      paddingX="3"
      paddingRight="5"
      width="100%"
      style={{ position: 'sticky', top: 0 }}
      zIndex={1}
    >
      <Row alignItems="center" justifyContent="flex-end" backgroundColor="2" borderRadius>
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
