import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLocation = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 64 64" {...props}>
    <path d="M32 0A24.03 24.03 0 0 0 8 24c0 17.23 22.36 38.81 23.31 39.72a.99.99 0 0 0 1.38 0C33.64 62.81 56 41.23 56 24A24.03 24.03 0 0 0 32 0m0 35a11 11 0 1 1 11-11 11.007 11.007 0 0 1-11 11" />
  </svg>
);
export default SvgLocation;
