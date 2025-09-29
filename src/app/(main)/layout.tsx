import { Suspense } from 'react';
import { Metadata } from 'next';
import { App } from './App';

export default function ({ children }) {
  return (
    <Suspense>
      <App>{children}</App>
    </Suspense>
  );
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Umami',
  },
};
