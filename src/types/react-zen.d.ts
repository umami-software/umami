import { ReactNode } from 'react';
import '@umami/react-zen';

declare module '@umami/react-zen' {
  interface SelectProps {
    children?: ReactNode;
  }

  interface TooltipProps {
    children?: ReactNode;
  }
}
