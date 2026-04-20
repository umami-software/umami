'use client';
import { useShare } from '@/components/hooks';
import { Logo } from '@/components/svg';
import { Icon, Row, Text } from '@umami/react-zen';

const LOGO_SIZE = { sm: 24, md: 32, lg: 40 };
const TEXT_SIZE = { sm: 'sm', md: 'base', lg: 'lg' } as const;

export function ShareBranding({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const share = useShare();
  const logoDomain = share?.whiteLabel?.domainName || 'https://umami.is';
  const logoName = share?.whiteLabel?.displayName || 'umami';
  const logoImage = share?.whiteLabel?.logoUrl;
  const height = LOGO_SIZE[size];

  return (
    <a href={logoDomain} target="_blank" rel="noopener" style={{ marginLeft: 12 }}>
      <Row alignItems="center" gap>
        {logoImage ? (
          <img src={logoImage} alt={logoName} style={{ height }} />
        ) : (
          <Icon>
            <Logo />
          </Icon>
        )}
        <Text size={TEXT_SIZE[size]} weight="bold">
          {logoName}
        </Text>
      </Row>
    </a>
  );
}
