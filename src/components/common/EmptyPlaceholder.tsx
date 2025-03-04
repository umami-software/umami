import { ReactNode } from 'react';
import { Icon, Text, Flexbox } from 'react-basics';
import { Icons } from '@/components/icons';

export interface EmptyPlaceholderProps {
  message?: string;
  children?: ReactNode;
}

export function EmptyPlaceholder({ message, children }: EmptyPlaceholderProps) {
  return (
    <Flexbox direction="column" alignItems="center" justifyContent="center" gap={60} height={600}>
      <Icon size="xl">
        <Icons.Logo />
      </Icon>
      <Text size="lg">{message}</Text>
      <div>{children}</div>
    </Flexbox>
  );
}
