import { ReactNode } from 'react';
import { Heading, Icon, Row } from '@umami/react-zen';

export function PageHeader({
  title,
  icon,
  children,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Row justifyContent="space-between" alignItems="center" paddingBottom="6">
      <Row gap="3">
        {icon && <Icon size="lg">{icon}</Icon>}
        {title && <Heading>{title}</Heading>}
      </Row>
      <Row justifyContent="flex-end">{children}</Row>
    </Row>
  );
}
