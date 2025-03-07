import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@umami/react-zen';
import { useLocale } from '@/components/hooks';

export interface LinkButtonProps {
  href: string;
  scroll?: boolean;
  variant?: any;
  children?: ReactNode;
}

export function LinkButton({
  href,
  variant = 'quiet',
  scroll = true,
  children,
  ...props
}: LinkButtonProps) {
  const { dir } = useLocale();

  return (
    <Button {...props} variant={variant} asChild>
      <Link href={href} dir={dir} scroll={scroll}>
        {children}
      </Link>
    </Button>
  );
}
