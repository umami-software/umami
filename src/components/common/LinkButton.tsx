import { Button } from '@umami/react-zen';
import type { ComponentProps, ReactNode } from 'react';
import Link from '@/components/common/Link';
import { useLocale } from '@/components/hooks';

export interface LinkButtonProps extends ComponentProps<typeof Button> {
  href: string;
  target?: string;
  scroll?: boolean;
  prefetch?: boolean;
  asAnchor?: boolean;
  children?: ReactNode;
}

export function LinkButton({
  href,
  variant = 'secondary',
  scroll = true,
  target,
  prefetch,
  children,
  asAnchor,
  ...props
}: LinkButtonProps) {
  const { dir } = useLocale();

  const linkElement = asAnchor ? (
    <a href={href} target={target}>
      {children}
    </a>
  ) : (
    <Link href={href} dir={dir} scroll={scroll} target={target} prefetch={prefetch}>
      {children}
    </Link>
  );

  return <Button {...props} variant={variant} nativeButton={false} render={linkElement} />;
}
