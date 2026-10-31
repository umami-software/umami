import { generateRegistrationOptions } from '@simplewebauthn/server';
import { parseRequest } from '@/lib/request';
import { json, notFound } from '@/lib/response';
import { getRelyingParty, saveChallenge, WEBAUTHN_TIMEOUT } from '@/lib/two-factor/webauthn';
import { getUserSecurityKeyCredentials } from '@/queries/prisma/securityKey';

export async function POST(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { id: userId, username } = auth.user;
  const { rpID, rpName } = getRelyingParty(request);
  const credentials = await getUserSecurityKeyCredentials(userId);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    userID: new TextEncoder().encode(userId),
    timeout: WEBAUTHN_TIMEOUT,
    attestationType: 'none',
    excludeCredentials: credentials.map(({ credentialId, transports }) => ({
      id: credentialId,
      transports,
    })),
    authenticatorSelection: {
      residentKey: 'discouraged',
      userVerification: 'discouraged',
    },
    preferredAuthenticatorType: 'securityKey',
  });

  await saveChallenge(userId, 'registration', options.challenge);

  return json(options);
}
