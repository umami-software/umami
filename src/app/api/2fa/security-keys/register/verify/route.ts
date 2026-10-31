import { type RegistrationResponseJSON, verifyRegistrationResponse } from '@simplewebauthn/server';
import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound } from '@/lib/response';
import { consumeChallenge, getRelyingParty } from '@/lib/two-factor/webauthn';
import { createSecurityKey, getSecurityKeyByCredentialId } from '@/queries/prisma/securityKey';

export async function POST(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const schema = z.object({
    name: z.string().trim().min(1).max(255),
    response: z.object({
      id: z.string(),
      rawId: z.string(),
      type: z.literal('public-key'),
      response: z.record(z.string(), z.any()),
      clientExtensionResults: z.record(z.string(), z.any()),
      authenticatorAttachment: z.string().optional(),
    }),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const response = body.response as RegistrationResponseJSON;
  const { rpID, origin } = getRelyingParty(request);

  const expectedChallenge = await consumeChallenge(userId, 'registration');

  if (!expectedChallenge) {
    return badRequest({
      code: 'security-key-error-challenge-expired',
      message: 'The security key request has expired',
    });
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  }).catch(() => null);

  if (!verification?.verified) {
    return badRequest({
      code: 'security-key-error-verification-failed',
      message: 'Security key verification failed',
    });
  }

  const { credential } = verification.registrationInfo;

  if (await getSecurityKeyByCredentialId(credential.id)) {
    return badRequest({
      code: 'security-key-error-already-registered',
      message: 'Security key is already registered',
    });
  }

  const securityKey = await createSecurityKey({
    userId,
    name: body.name,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    transports: credential.transports ?? [],
  });

  return json(securityKey);
}
