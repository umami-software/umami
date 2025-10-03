import * as React from 'react';
import type { SVGProps } from 'react';
const SvgNodes = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={512} height={512} viewBox="0 0 24 24" {...props}>
    <path
      fillRule="evenodd"
      d="M19 9.874A4.002 4.002 0 0 0 18 2a4 4 0 0 0-3.874 3H9.874A4.002 4.002 0 0 0 2 6a4 4 0 0 0 3 3.874v4.252A4.002 4.002 0 0 0 6 22a4 4 0 0 0 3.874-3h4.252A4.002 4.002 0 0 0 22 18a4 4 0 0 0-3-3.874zM6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4m3.874 3A4.01 4.01 0 0 1 7 9.874v4.252A4.01 4.01 0 0 1 9.874 17h4.252A4.01 4.01 0 0 1 17 14.126V9.874A4.01 4.01 0 0 1 14.126 7zM18 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 18a2 2 0 1 0-4 0 2 2 0 0 0 4 0"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgNodes;
