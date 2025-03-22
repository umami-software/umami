import { ThemeButton, Row, Button, Icon } from '@umami/react-zen';
import { LanguageButton } from '@/components/input/LanguageButton';
import { ProfileButton } from '@/components/input/ProfileButton';
import { TeamsButton } from '@/components/input/TeamsButton';
import type { RowProps } from '@umami/react-zen/Row';
import useGlobalState from '@/components/hooks/useGlobalState';
import { Lucide } from '@/components/icons';

export function MenuBar(props: RowProps) {
  const [isCollapsed, setCollapsed] = useGlobalState('sidenav-collapsed');

  return (
    <Row
      {...props}
      justifyContent="space-between"
      alignItems="center"
      paddingY="3"
      paddingX="3"
      paddingRight="5"
    >
      <Row>
        <Button onPress={() => setCollapsed(!isCollapsed)} variant="quiet">
          <Icon>
            <Lucide.PanelLeft />
          </Icon>
        </Button>
        <TeamsButton />
      </Row>
      <Row justifyContent="flex-end">
        <ThemeButton />
        <LanguageButton />
        <ProfileButton />
      </Row>
    </Row>
  );
}
