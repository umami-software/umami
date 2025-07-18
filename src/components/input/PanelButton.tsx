import { Button, Icon } from '@umami/react-zen';
import { PanelLeft } from '@/components/icons';
import { useGlobalState } from '@/components/hooks';

export function PanelButton() {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');
  return (
    <Button onPress={() => setIsCollapsed(!isCollapsed)} variant="quiet">
      <Icon>
        <PanelLeft />
      </Icon>
    </Button>
  );
}
