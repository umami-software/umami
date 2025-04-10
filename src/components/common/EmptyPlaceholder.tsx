import { ReactNode } from 'react';
import { Icon, Text, Column } from '@umami/react-zen';
import { Icons } from '@/components/icons';

export interface EmptyPlaceholderProps {
  message?: string;
  children?: ReactNode;
}

export function EmptyPlaceholder({ message, children }: EmptyPlaceholderProps) {
  return (
    <Column alignItems="center" justifyContent="center" gap="5" height="100%" width="100%">
      <Icon size="xl">
        <Icons.Logo />
      </Icon>
      <Text size="lg">{message}</Text>
      <div>{children}</div>
    </Column>
  );
}
