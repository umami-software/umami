import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { badRequest, json, notFound, unauthorized } from '@/lib/response';
import {
  getPartialAuthUserId,
  getRelyingParty,
  saveChallenge,
  WEBAUTHN_TIMEOUT,
} from '@/lib/two-factor/webauthn';
import { getUserSecurityKeyCredentials } from '@/queries/prisma/securityKey';

export async function POST(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const userId = getPartialAuthUserId(request);

  if (!userId) {
    return unauthorized({ code: 'two-factor-error-invalid-partial-token' });
  }

  const credentials = await getUserSecurityKeyCredentials(userId);

  if (!credentials.length) {
    return badRequest({
      code: 'security-key-error-not-registered',
      message: 'No security keys are registered for this user',
    });
  }

  const { rpID } = getRelyingParty(request);

  const options = await generateAuthenticationOptions({
    rpID,
    timeout: WEBAUTHN_TIMEOUT,
    allowCredentials: credentials.map(({ credentialId, transports }) => ({
      id: credentialId,
      transports,
    })),
    userVerification: 'discouraged',
  });

  await saveChallenge(userId, 'authentication', options.challenge);

  return json(options);
}
