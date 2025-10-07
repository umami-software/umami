import * as oidcClient from 'openid-client';
import { NextRequest } from 'next/server';
import { createSecureToken } from '@/lib/jwt';
import { createUser, getUserByUsername } from '@/queries';
import { json } from '@/lib/response';
import redis from '@/lib/redis';
import { saveAuth } from '@/lib/auth';
import { secret, uuid } from '@/lib/crypto';
import { ROLES } from '@/lib/constants';
import { redirect } from 'next/navigation';
import { createOidcState, getOidcState } from '@/queries/prisma/oidc';

const oidcConfig = await oidcClient.discovery(
  new URL(process.env.OIDC_ISSUER),
  process.env.OIDC_CLIENT_ID,
  process.env.OIDC_CLIENT_SECRET,
);

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state');
  if (state) {
    const { codeVerifier } = await getOidcState(state);

    const tokens = await oidcClient.authorizationCodeGrant(oidcConfig, req, {
      pkceCodeVerifier: codeVerifier,
      expectedState: state,
    });

    const profile = await oidcClient.fetchUserInfo(
      oidcConfig,
      tokens.access_token,
      tokens.claims().sub,
    );

    // TODO - have a mapping table of profile.sub => username so no conflicts or claiming existing accounts
    // TODO - make preferred_username configurable
    let user = await getUserByUsername(profile.preferred_username);

    if (!user) {
      user = await createUser({
        id: uuid(),
        username: profile.preferred_username,
        password: '',
        role: ROLES.user,
      });
    }

    const { id, role, createdAt } = user;

    let token: string;

    if (redis.enabled) {
      token = await saveAuth({ userId: id, role });
    } else {
      token = createSecureToken({ userId: user.id, role }, secret());
    }

    return json({
      token,
      user: { id, username: user.username, role, createdAt, isAdmin: role === ROLES.admin },
    });
  } else {
    const redirectUri: string = process.env.OIDC_RETURN_URL;
    //const redirectUri = 'http://localhost:3000/api/auth/login/oidc';
    const scope: string = 'openid profile email';
    const oidcCodeVerifier: string = oidcClient.randomPKCECodeVerifier();
    const codeChallenge: string = await oidcClient.calculatePKCECodeChallenge(oidcCodeVerifier);
    let state: string = uuid();

    const parameters: Record<string, string> = {
      redirect_uri: redirectUri,
      state,
      scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };

    if (!oidcConfig.serverMetadata().supportsPKCE()) {
      /**
       * We cannot be sure the server supports PKCE so we're going to use state too.
       * Use of PKCE is backwards compatible even if the AS doesn't support it which
       * is why we're using it regardless. Like PKCE, random state must be generated
       * for every redirect to the authorization_endpoint.
       */
      state = oidcClient.randomState();
      parameters.state = state;
    }

    await createOidcState({ state, codeVerifier: oidcCodeVerifier });

    const redirectTo: URL = oidcClient.buildAuthorizationUrl(oidcConfig, parameters);
    redirect(redirectTo.toString());
  }
}
