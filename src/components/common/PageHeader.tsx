import { ReactNode } from 'react';
import { Heading, Icon, Row, RowProps, Text, Column } from '@umami/react-zen';

export function PageHeader({
  title,
  description,
  label,
  icon,
  showBorder = true,
  children,
  ...props
}: {
  title: string;
  description?: string;
  label?: ReactNode;
  icon?: ReactNode;
  showBorder?: boolean;
  allowEdit?: boolean;
  className?: string;
  children?: ReactNode;
} & RowProps) {
  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      paddingY="6"
      marginBottom="6"
      border={showBorder ? 'bottom' : undefined}
      width="100%"
      {...props}
    >
      <Column gap="2">
        {label}
        <Row alignItems="center" gap="3">
          {icon && (
            <Icon size="md" color="muted">
              {icon}
            </Icon>
          )}
          {title && <Heading size={{ xs: '2', md: '3', lg: '4' }}>{title}</Heading>}
        </Row>
        {description && (
          <Text color="muted" truncate style={{ maxWidth: 600 }} title={description}>
            {description}
          </Text>
        )}
      </Column>
      <Row justifyContent="flex-end">{children}</Row>
    </Row>
  );
}
