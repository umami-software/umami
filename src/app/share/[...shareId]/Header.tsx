import { Icon, Row, Text, ThemeButton } from '@umami/react-zen';
import type { WhiteLabel } from '@/app/api/share/[shareId]/route';
import { LanguageButton } from '@/components/input/LanguageButton';
import { PreferencesButton } from '@/components/input/PreferencesButton';
import { Logo } from '@/components/svg';

export function Header({ whiteLabel }: { whiteLabel?: WhiteLabel }) {
  const logoUrl = whiteLabel?.url || 'https://umami.is';
  const logoName = whiteLabel?.name || 'umami';
  const logoImage = whiteLabel?.image;

  return (
    <Row as="header" justifyContent="space-between" alignItems="center" paddingY="3">
      <a href={logoUrl} target="_blank" rel="noopener">
        <Row alignItems="center" gap>
          {logoImage ? (
            <img src={logoImage} alt={logoName} style={{ height: 24 }} />
          ) : (
            <Icon>
              <Logo />
            </Icon>
          )}
          <Text weight="bold">{logoName}</Text>
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
