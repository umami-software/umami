'use client';
import { Column, Icon, Row, Text } from '@umami/react-zen';
import { WebsiteSettingsPage } from '@/app/(main)/settings/websites/[websiteId]/WebsiteSettingsPage';
import { LinkButton } from '@/components/common/LinkButton';
import { Arrow } from '@/components/icons';
import { useNavigation } from '@/components/hooks';

export function SettingsPage({ websiteId }: { websiteId: string }) {
  const { pathname } = useNavigation();
  return (
    <Column gap>
      <Row marginTop="3">
        <LinkButton href={pathname.replace('/settings', '')}>
          <Row alignItems="center" gap>
            <Icon rotate={180}>
              <Arrow />
            </Icon>
            <Text>Back</Text>
          </Row>
        </LinkButton>
      </Row>
      <WebsiteSettingsPage websiteId={websiteId} />
    </Column>
  );
}
