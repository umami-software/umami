import * as React from 'react';
import type { SVGProps } from 'react';
const SvgExpand = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={512}
    height={512}
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    clipRule="evenodd"
    viewBox="0 0 48 48"
    {...props}
  >
    <path d="M7.5 40.018v-10.5c0-1.379-1.12-2.5-2.5-2.5s-2.5 1.121-2.5 2.5v11a4.5 4.5 0 0 0 4.5 4.5h12a2.5 2.5 0 0 0 0-5zm33 0H29a2.5 2.5 0 0 0 0 5h12a4.5 4.5 0 0 0 4.5-4.5v-11c0-1.379-1.12-2.5-2.5-2.5s-2.5 1.121-2.5 2.5zm-33-33H19a2.5 2.5 0 0 0 0-5H7a4.5 4.5 0 0 0-4.5 4.5v11a2.5 2.5 0 0 0 5 0zm33 0v10.5a2.5 2.5 0 0 0 5 0v-11a4.5 4.5 0 0 0-4.5-4.5H29a2.5 2.5 0 0 0 0 5z" />
  </svg>
);
export default SvgExpand;
