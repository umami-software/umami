import { useState } from 'react';
import { Button, Column, Icon, Row } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { useReport } from '@/components/hooks';

export function ReportMenu({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { report } = useReport();

  if (!report) {
    return null;
  }

  return (
    <Column>
      <Row alignItems="center" justifyContent="flex-end">
        <Button variant="quiet" onPress={() => setCollapsed(!collapsed)}>
          <Icon>
            <Icons.PanelLeft />
          </Icon>
        </Button>
      </Row>
      {!collapsed && children}
    </Column>
  );
}
