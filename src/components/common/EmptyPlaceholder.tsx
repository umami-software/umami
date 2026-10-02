import { Column, Icon, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';

export interface EmptyPlaceholderProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  minHeight?: string;
  children?: ReactNode;
}

export function EmptyPlaceholder({
  title,
  description,
  icon,
  minHeight,
  children,
}: EmptyPlaceholderProps) {
  return (
    <Column
      alignItems="center"
      justifyContent="center"
      gap="5"
      height="100%"
      width="100%"
      minHeight={minHeight}
    >
      {icon && (
        <Icon color="muted" size="xl">
          {icon}
        </Icon>
      )}
      {title && (
        <Text weight="bold" size="lg">
          {title}
        </Text>
      )}
      {description && <Text color="muted">{description}</Text>}
      {children}
    </Column>
  );
}
