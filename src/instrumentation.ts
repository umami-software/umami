import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { getAppSecret } from './lib/app-secret';

export function register() {
  // Deployment secrets are required at runtime, not while building the image.
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    getAppSecret();
  }
}
