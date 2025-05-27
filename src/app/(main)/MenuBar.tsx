import { ThemeButton, Row, Button, Icon } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { PanelLeft, Slash } from '@/components/icons';
import { useNavigation, useGlobalState } from '@/components/hooks';

export function MenuBar() {
  const [isCollapsed, setCollapsed] = useGlobalState('sidenav-collapsed');
  const { websiteId } = useNavigation();

  const handleSelect = () => {};

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
        <Button onPress={() => setCollapsed(!isCollapsed)} variant="quiet">
          <Icon>
            <PanelLeft />
          </Icon>
        </Button>
        <Row alignItems="center" gap="1">
          <TeamsButton />
          {websiteId && (
            <>
              <Icon strokeColor="7" rotate={-25}>
                <Slash />
              </Icon>
              <WebsiteSelect variant="quiet" websiteId={websiteId} onSelect={handleSelect} />
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
