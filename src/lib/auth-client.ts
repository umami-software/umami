import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // No baseURL: the client resolves window.location.origin and appends
  // basePath. Passing a relative baseURL (e.g. '/api/auth') is rejected by
  // better-auth ("Invalid base URL"), which is why the app basePath is
  // provided here instead.
  basePath: `${process.env.basePath || ''}/api/auth`,
  plugins: [usernameClient()],
});
