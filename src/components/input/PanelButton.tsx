import { Button, Icon } from '@umami/react-zen';
import type { ComponentProps } from 'react';
import { useGlobalState } from '@/components/hooks';
import { PanelLeft } from '@/components/icons';

export function PanelButton(props: ComponentProps<typeof Button>) {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed');
  return (
    <Button
      onClick={() => setIsCollapsed(!isCollapsed)}
      variant="ghost"
      className="hover:bg-transparent"
      {...props}
      style={{ padding: 0 }}
    >
      <Icon strokeColor="muted">
        <PanelLeft />
      </Icon>
    </Button>
  );
}
