import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth-server';

export const { GET, POST } = toNextJsHandler(auth.handler);
