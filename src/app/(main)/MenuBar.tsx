import { ThemeButton, Row, Button, Icon } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import type { RowProps } from '@umami/react-zen/Row';
import useGlobalState from '@/components/hooks/useGlobalState';
import { Lucide } from '@/components/icons';
import { WebsiteSelect } from '@/components/input/WebsiteSelect';
import { useNavigation } from '@/components/hooks';

export function MenuBar(props: RowProps) {
  const [isCollapsed, setCollapsed] = useGlobalState('sidenav-collapsed');
  const { websiteId } = useNavigation();

  const handleSelect = () => {};

  return (
    <Row
      {...props}
      justifyContent="space-between"
      alignItems="center"
      paddingY="3"
      paddingX="3"
      paddingRight="5"
      backgroundColor="2"
      border="bottom"
    >
      <Row alignItems="center">
        <Button onPress={() => setCollapsed(!isCollapsed)} variant="quiet">
          <Icon>
            <Lucide.PanelLeft />
          </Icon>
        </Button>
        <Row alignItems="center" gap="1">
          <TeamsButton />
          {websiteId && (
            <>
              <Icon strokeColor="7" rotate={-25}>
                <Lucide.Slash />
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
