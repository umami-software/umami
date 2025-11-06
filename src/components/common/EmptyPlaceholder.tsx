import { ReactNode } from 'react';
import { Icon, Text, Column } from '@umami/react-zen';

export interface EmptyPlaceholderProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function EmptyPlaceholder({ title, description, icon, children }: EmptyPlaceholderProps) {
  return (
    <Column alignItems="center" justifyContent="center" gap="5" height="100%" width="100%">
      {icon && (
        <Icon color="10" size="xl">
          {icon}
        </Icon>
      )}
      {title && (
        <Text weight="bold" size="4">
          {title}
        </Text>
      )}
      {description && <Text color="muted">{description}</Text>}
      {children}
    </Column>
  );
}
