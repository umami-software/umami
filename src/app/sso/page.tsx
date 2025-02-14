import { Suspense } from 'react';
import { SSOPage } from './SSOPage';

export default function () {
  return (
    <Suspense>
      <SSOPage />
    </Suspense>
  );
}
