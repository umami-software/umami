import { Column } from '@umami/react-zen';

export interface BoardProps {
  children?: React.ReactNode;
}

export function Board({ children }: BoardProps) {
  return <Column>{children}</Column>;
}
