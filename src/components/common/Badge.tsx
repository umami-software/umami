import styles from './Badge.module.css';

export interface BadgeProps {
  variant: 'good' | 'warning' | 'danger' | 'gray';
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ variant, children, dot = true }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
