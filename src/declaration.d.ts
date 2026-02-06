declare module '*.css';
declare module '*.svg';
declare module '*.json';
declare module 'bcryptjs';
declare module 'chartjs-adapter-date-fns';
declare module 'cors';
declare module 'date-fns-tz';
declare module 'debug';
declare module 'fs-extra';
declare module 'jsonwebtoken';
declare module 'md5';
declare module 'papaparse';
declare module 'prettier';
declare module 'react-simple-maps';
declare module 'semver';
declare module 'tsup';
declare module 'uuid';
declare module '@umami/esbuild-plugin-css-modules';

interface UmamiTracker {
  track: {
    (): Promise<string>;
    (eventName: string): Promise<string>;
    (eventName: string, obj: Record<string, any>): Promise<string>;
    (properties: Record<string, any>): Promise<string>;
    (eventFunction: (props: Record<string, any>) => Record<string, any>): Promise<string>;
  };
  identify: (data: Record<string, any>) => Promise<string>;
}

interface Window {
  umami: UmamiTracker;
}
