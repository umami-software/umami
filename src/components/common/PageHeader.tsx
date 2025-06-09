import { ReactNode } from 'react';
import { Heading, Icon, Row, Text } from '@umami/react-zen';

export function PageHeader({
  title,
  description,
  icon,
  showBorder = true,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  showBorder?: boolean;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      paddingY="6"
      border={showBorder ? 'bottom' : undefined}
      width="100%"
    >
      <Row alignItems="center" gap="3">
        {icon && <Icon>{icon}</Icon>}
        {title && <Heading size="4">{title}</Heading>}
        {description && <Text color="muted">{description}</Text>}
      </Row>
      <Row justifyContent="flex-end">{children}</Row>
    </Row>
  );
}
