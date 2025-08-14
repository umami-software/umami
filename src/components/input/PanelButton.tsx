import { Button, Icon, ButtonProps } from '@umami/react-zen';
import { PanelLeft } from '@/components/icons';
import { useGlobalState } from '@/components/hooks';

export function PanelButton(props: ButtonProps) {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');
  return (
    <Button
      onPress={() => setIsCollapsed(!isCollapsed)}
      variant="zero"
      {...props}
      style={{ padding: 0 }}
    >
      <Icon strokeColor="muted">
        <PanelLeft />
      </Icon>
    </Button>
  );
}
