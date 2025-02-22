import { ReactNode } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { useLocale } from '@/components/hooks';
import styles from './LinkButton.module.css';

export interface LinkButtonProps {
  href: string;
  className?: string;
  variant?: string;
  scroll?: boolean;
  children?: ReactNode;
}

export function LinkButton({ href, className, variant, scroll = true, children }: LinkButtonProps) {
  const { dir } = useLocale();

  return (
    <Link
      className={classNames(styles.button, className, { [styles[variant]]: true })}
      href={href}
      dir={dir}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}

export default LinkButton;
