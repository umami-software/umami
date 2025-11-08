import * as React from 'react';
import type { SVGProps } from 'react';
const SvgSwitch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={200}
    height={200}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m16 3 4 4-4 4M10 7h10M8 13l-4 4 4 4M4 17h9" />
  </svg>
);
export default SvgSwitch;
