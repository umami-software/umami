import { ReactNode } from 'react';
import { Heading, Icon, Row, Text } from '@umami/react-zen';

export function SectionHeader({
  title,
  description,
  icon,
  children,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Row justifyContent="space-between" alignItems="center" height="60px">
      <Row gap="3" alignItems="center">
        {icon && <Icon>{icon}</Icon>}
        {title && <Heading size="3">{title}</Heading>}
        {description && <Text color="muted">{description}</Text>}
      </Row>
      <Row justifyContent="flex-end">{children}</Row>
    </Row>
  );
}
