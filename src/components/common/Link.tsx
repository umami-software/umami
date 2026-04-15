import NextLink from 'next/link';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

export type LinkProps = ComponentPropsWithoutRef<typeof NextLink>;
const cloudMode = !!process.env.cloudMode;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ prefetch, ...props }, ref) {
  return <NextLink ref={ref} prefetch={cloudMode ? (prefetch ?? false) : prefetch} {...props} />;
});

export default Link;
