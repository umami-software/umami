import { ReactNode } from 'react';
import { Heading, Icon, Row, Text } from '@umami/react-zen';

export function PageHeader({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Row justifyContent="space-between" alignItems="center" marginY="6">
      <Row gap="3">
        {icon && <Icon size="lg">{icon}</Icon>}
        {title && <Heading size="2">{title}</Heading>}
        {description && <Text color="muted">{description}</Text>}
      </Row>
      <Row justifyContent="flex-end">{children}</Row>
    </Row>
  );
}
