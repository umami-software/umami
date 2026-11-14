import styles from './ClearData.module.css';

// A database stack shedding records while deleting, and a check mark once done.
export function ClearDataAnimation({ variant = 'deleting' }: { variant?: 'deleting' | 'done' }) {
  return (
    <div className={styles.animation} data-test={`clear-data-animation-${variant}`}>
      {variant === 'done' ? (
        <svg className={styles.check} viewBox="0 0 120 120" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <circle cx="60" cy="60" r="40" />
            <path d="M42 61l12 12 24-26" strokeLinejoin="round" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
            <ellipse cx="60" cy="18" rx="32" ry="10" />
            <path d="M28 18v20c0 5.5 14.3 10 32 10s32-4.5 32-10V18" />
            <path d="M28 38v20c0 5.5 14.3 10 32 10s32-4.5 32-10V38" />
          </g>
          <rect className={styles.record} x="40" y="74" width="12" height="6" rx="2" />
          <rect className={styles.record} x="54" y="74" width="12" height="6" rx="2" />
          <rect className={styles.record} x="68" y="74" width="12" height="6" rx="2" />
        </svg>
      )}
    </div>
  );
}
