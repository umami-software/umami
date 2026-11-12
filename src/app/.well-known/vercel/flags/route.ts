import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import { flags } from '@/lib/flags';

// Flags discovery endpoint for the Vercel Flags Explorer. Requires FLAGS_SECRET;
// requests without a valid Authorization header are rejected with a 401.
export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flags);
});
