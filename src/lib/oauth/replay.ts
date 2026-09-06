/**
 * Replay detection for authorization codes lives in `consumeAuthorizationCode`
 * (`src/queries/prisma/oauth.ts`): a second redemption returns the original grant so that every
 * refresh token issued from it can be revoked (OAuth 2.1 §4.1.2).
 */
export {};
