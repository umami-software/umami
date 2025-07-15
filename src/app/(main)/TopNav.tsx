import { ThemeButton, Row, Icon } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { Slash } from '@/components/icons';
import { useNavigation } from '@/components/hooks';

export function TopNav() {
  const { teamId, websiteId, pathname } = useNavigation();
  const isSettings = pathname.includes('/settings');

  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      paddingY="3"
      paddingX="3"
      paddingRight="5"
      border="bottom"
      width="100%"
    >
      <Row alignItems="center">
        <Row alignItems="center" gap="1">
          <TeamsButton />
          {websiteId && !isSettings && (
            <>
              <Icon strokeColor="7" rotate={-25}>
                <Slash />
              </Icon>
              <WebsiteSelect variant="quiet" websiteId={websiteId} teamId={teamId} />
            </>
          )}
        </Row>
      </Row>
      <Row alignItems="center" justifyContent="flex-end">
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
