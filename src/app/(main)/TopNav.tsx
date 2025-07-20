import { ThemeButton, Row, Icon } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { Slash } from '@/components/icons';
import { useNavigation } from '@/components/hooks';
import { PanelButton } from '@/components/input/PanelButton';

export function TopNav() {
  const { teamId, websiteId, pathname } = useNavigation();
  const isWebsite = websiteId && !pathname.includes('/settings');

  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      paddingY="2"
      paddingX="3"
      paddingRight="5"
      width="100%"
      style={{ position: 'sticky', top: 0 }}
      backgroundColor="2"
      zIndex={1}
    >
      <Row alignItems="center">
        <PanelButton isDisabled={!!isWebsite} />
        <Seperator />
        <TeamsButton />
        {isWebsite && (
          <>
            <Seperator />
            <WebsiteSelect
              buttonProps={{ variant: 'quiet' }}
              websiteId={websiteId}
              teamId={teamId}
            />
          </>
        )}
      </Row>
      <Row alignItems="center" justifyContent="flex-end">
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}

const Seperator = () => {
  return (
    <Icon strokeColor="7" rotate={-25}>
      <Slash />
    </Icon>
  );
};
