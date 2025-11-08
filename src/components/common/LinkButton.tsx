import { ReactNode } from 'react';
import Link from 'next/link';
import { Button, ButtonProps } from '@umami/react-zen';
import { useLocale } from '@/components/hooks';

export interface LinkButtonProps extends ButtonProps {
  href: string;
  target?: string;
  scroll?: boolean;
  variant?: any;
  prefetch?: boolean;
  children?: ReactNode;
}

export function LinkButton({
  href,
  variant,
  scroll = true,
  target,
  prefetch,
  children,
  ...props
}: LinkButtonProps) {
  const { dir } = useLocale();

  return (
    <Button {...props} variant={variant} asChild>
      <Link href={href} dir={dir} scroll={scroll} target={target} prefetch={prefetch}>
        {children}
      </Link>
    </Button>
  );
}
