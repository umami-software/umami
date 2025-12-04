import { Button, type ButtonProps } from '@umami/react-zen';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale } from '@/components/hooks';

export interface LinkButtonProps extends ButtonProps {
  href: string;
  target?: string;
  scroll?: boolean;
  variant?: any;
  prefetch?: boolean;
  asAnchor?: boolean;
  children?: ReactNode;
}

export function LinkButton({
  href,
  variant,
  scroll = true,
  target,
  prefetch,
  children,
  asAnchor,
  ...props
}: LinkButtonProps) {
  const { dir } = useLocale();

  return (
    <Button {...props} variant={variant} asChild>
      {asAnchor ? (
        <a href={href} target={target}>
          {children}
        </a>
      ) : (
        <Link href={href} dir={dir} scroll={scroll} target={target} prefetch={prefetch}>
          {children}
        </Link>
      )}
    </Button>
  );
}
