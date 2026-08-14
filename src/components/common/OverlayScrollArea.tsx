import { cn, type ScrollAreaProps, ScrollArea as ZenScrollArea } from '@umami/react-zen';
import styles from './OverlayScrollArea.module.css';

export function OverlayScrollArea({ className, ...props }: ScrollAreaProps) {
  return <ZenScrollArea className={cn(styles.root, className)} {...props} />;
}
