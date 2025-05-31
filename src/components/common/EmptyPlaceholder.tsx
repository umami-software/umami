import { ReactNode } from 'react';
import { Icon, Text, Column } from '@umami/react-zen';
import { Logo } from '@/components/icons';

export interface EmptyPlaceholderProps {
  message?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function EmptyPlaceholder({ message, icon, children }: EmptyPlaceholderProps) {
  return (
    <Column alignItems="center" justifyContent="center" gap="5" height="100%" width="100%">
      <Icon size="xl">{icon || <Logo />}</Icon>
      <Text>{message}</Text>
      <div>{children}</div>
    </Column>
  );
}
