import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLock = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 24 24" {...props}>
    <path d="M18.75 9H18V6c0-3.309-2.691-6-6-6S6 2.691 6 6v3h-.75A2.253 2.253 0 0 0 3 11.25v10.5C3 22.991 4.01 24 5.25 24h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5C21 10.009 19.99 9 18.75 9M8 6c0-2.206 1.794-4 4-4s4 1.794 4 4v3H8zm5 10.722V19a1 1 0 1 1-2 0v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722" />
  </svg>
);
export default SvgLock;
